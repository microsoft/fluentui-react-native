import { FSEntry } from '@rnx-kit/tools-filesystem';
import { SHARED_OBJ_CUTOFF } from './const.ts';
import { writeArrayOrObjContents } from './helpers.ts';

type ObjectSpread = {
  spread: string;
};

type ObjectValue = {
  key: string;
  value: string;
};

function isObjectValue(value: unknown): value is ObjectValue {
  return typeof value === 'object' && value !== null && 'key' in value && 'value' in value;
}

type ObjectValueUsage = ObjectValue & {
  /**
   * The enclosing object short names used to reference this key/value pair.
   */
  appearsIn: string[];
};

export type CodegenValue = {
  /** the text that will be output to the generated file, will be used for comparisons */
  raw: string;
  /** the ramp category tihs value belongs to, if not set it will not be ramped */
  ramp?: string;
  /** number of references to this value */
  refs: number;
};

export type ObjectHelper = {
  addSpread(spread: string, atStart?: boolean): void;
  addValue(key: string, value: string): void;
  removeValue(key: string): void;
  outputText(): string;
};

type CategoryCache = {
  /** number of items in this category */
  count: number;
  /** Category name */
  category: string;
  /** local objects in this category */
  sharedObjects: Record<string, ObjectHelper>;
  /** exported objects in this category */
  realObjects: Record<string, ObjectHelper>;
  /** shared exported values in this category, for object combining */
  sharedValues: Record<string, ObjectValueUsage>;
  /** short names */
  shortNames: Record<string, string>;
};

/**
 * Pattern to capture the text inside PlatformColor('<text>') or PlatformColor("<text>")
 */
const platformColorPattern = /^PlatformColor\((['"])(.*?)\1\)$/;

function rampConstName(value: string, prefix: string, ramp: Record<string, unknown>): string {
  if (prefix === 'color') {
    if (value.startsWith(`'#`) || value.startsWith(`"#`)) {
      // Handle color values that are either '#RRGGBB' or "#RRGGBB"
      return `rgb${value.slice(2, -1)}`;
    } else {
      const match = value.match(platformColorPattern);
      if (match && match[2]) {
        return `platColor${match[2]}`;
      }
    }
  }
  return `${prefix}${Object.keys(ramp).length}`;
}

export class CodegenFile {
  private fsEntry: FSEntry;
  private rampedConstants: Record<string, Record<string, string>> = {};
  private objCategories: Record<string, CategoryCache> = {};
  private lines: string[] = [];
  header: string = `/** Generated file. Do not edit. */`;

  constructor(filePath: string) {
    this.fsEntry = new FSEntry(filePath);
  }

  rampConstant = (prefix: string, value: string) => {
    const ramp = (this.rampedConstants[prefix] ??= {});
    return (ramp[value] ??= rampConstName(value, prefix, ramp));
  };

  rampString = (prefix: string, value: string) => {
    return this.rampConstant(prefix, `'${value}'`);
  };

  private writeRamp(ramp: Record<string, string>): string {
    return Object.entries(ramp)
      .map(([key, value]) => `const ${value} = ${key};`)
      .join('\n');
  }

  private writeAllRamps(): string {
    return Object.values(this.rampedConstants)
      .map((ramp) => this.writeRamp(ramp))
      .join('\n\n');
  }

  addExportConst = (name: string, value: string) => {
    this.lines.push(`export const ${name} = ${value};`);
  };

  addRaw = (line: string) => {
    this.lines.push(line);
  };

  /**
   * Add an object to the codegen file, returning an ObjectHelper to manipulate it.
   * @param objType the category type of the object, will be used as a preface for shared common objects
   * @param name the name of the object
   * @param shortName a shorter alias for the object, should start with uppercase, will be joined for shared objects
   * @param local whether the object is local to this file
   * @param tsType the TypeScript type of the object, optional
   * @returns an ObjectHelper to manipulate the object
   */
  addObject(objType: string, name: string, shortName: string, local?: boolean, tsType?: string): ObjectHelper {
    const category = (this.objCategories[objType] ??= {
      count: 0,
      category: objType,
      sharedObjects: {},
      realObjects: {},
      sharedValues: {},
      shortNames: {},
    });
    category.count++;
    category.shortNames[shortName] = name;
    const objHelper = this.createObjectHelper(category, name, shortName, local, tsType);
    category.realObjects[name] = objHelper;
    return objHelper;
  }

  private createObjectHelper(
    cache: CategoryCache,
    name: string,
    shortName: string,
    local?: boolean,
    tsType?: string,
    upstream?: boolean,
  ): ObjectHelper {
    const valCache = cache.sharedValues;
    const entries: (ObjectValue | ObjectSpread)[] = [];
    const objHelper: ObjectHelper = {
      addSpread(spread: string, atStart: boolean = false) {
        if (atStart) {
          entries.unshift({ spread });
        } else {
          entries.push({ spread });
        }
      },
      addValue(key: string, value: string) {
        entries.push({ key, value });
        if (!upstream) {
          const cacheKey = JSON.stringify({ key, value });
          const cacheEntry = (valCache[cacheKey] ??= { key, value, appearsIn: [] });
          cacheEntry.appearsIn.push(shortName);
        }
      },
      removeValue(key: string) {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (isObjectValue(entry) && entry.key === key) {
            entries.splice(i, 1);
            break;
          }
        }
      },
      outputText() {
        if (entries.length === 1 && !isObjectValue(entries[0])) {
          // if the only entry is a single spread, just assign it directly
          return getExportObjString(name, local, tsType) + ' = ' + entries[0].spread + ';';
        }
        return getExportObjString(name, local, tsType) + ' = ' + writeArrayOrObjContents(entries.map(getValueText), 'object') + ';';
      },
    };
    return objHelper;
  }

  private writeObjectCategory(cache: CategoryCache): string {
    const exported = Object.keys(cache.realObjects);
    if (exported.length === 0) return '';

    if (exported.length > 1) {
      const bucketedValues: Record<string, ObjectValueUsage[]> = {};
      // group shared values by their shared object key
      for (const value of Object.values(cache.sharedValues)) {
        if (value.appearsIn.length > 1) {
          const sharedObjKey = getSharedObjName(cache.category, exported.length, value.appearsIn);
          (bucketedValues[sharedObjKey] ??= []).push(value);
        }
      }
      // create shared objects for each bucketed value group with enough values
      const shortNames = cache.shortNames;
      for (const [sharedObjName, values] of Object.entries(bucketedValues)) {
        if (values.length >= SHARED_OBJ_CUTOFF) {
          const downstreamObjects = values[0].appearsIn.map((name) => cache.realObjects[shortNames[name]]);
          // create the new shared object for this group of values
          const sharedObj = this.createObjectHelper(cache, sharedObjName, sharedObjName, true, undefined, true);
          cache.sharedObjects[sharedObjName] = sharedObj;
          // add each value, removing them from the downstream objects
          for (const value of values) {
            sharedObj.addValue(value.key, value.value);
            for (const downstreamObj of downstreamObjects) {
              downstreamObj.removeValue(value.key);
            }
          }
          // now add a spread reference to the shared object in each downstream object
          for (const downstreamObj of downstreamObjects) {
            downstreamObj.addSpread(sharedObjName, true);
          }
        }
      }
    }

    let result = '';
    const sharedObjects = Object.values(cache.sharedObjects);
    if (sharedObjects.length > 0) {
      result += sharedObjects.map((obj) => obj.outputText()).join('\n') + '\n\n';
    }
    result += Object.values(cache.realObjects)
      .map((obj) => obj.outputText())
      .join('\n');
    return result;
  }

  finish(): string {
    let content = this.header;
    content += '\n\n' + this.writeAllRamps() + '\n\n';
    content += this.lines.join('\n');
    const objTypes = Object.values(this.objCategories);
    if (objTypes.length > 0) {
      content += objTypes.map((obj) => this.writeObjectCategory(obj)).join('\n\n') + '\n\n';
    }
    this.fsEntry.content = content;
    this.fsEntry.writeContentsSync();
    return content;
  }
}

function getValueText(entry: ObjectValue | ObjectSpread): string {
  if (isObjectValue(entry)) {
    return `${entry.key}: ${entry.value}`;
  } else {
    return `...${entry.spread}`;
  }
}

function getExportObjString(name: string, local?: boolean, tsType?: string): string {
  return `${local ? '' : 'export '}const ${name}${tsType ? `: ${tsType}` : ''}`;
}

function getSharedObjName(category: string, count: number, appearsIn: string[]): string {
  if (appearsIn.length === 0) {
    return `${category}None`;
  } else if (appearsIn.length === count) {
    return `${category}Common`;
  }
  return `${category}${appearsIn.join('')}`;
}
