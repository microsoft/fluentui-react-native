## ToDo: foundation-compose

**Token Functions Shouldn't have to Merge**

Token functions should return optional fragments to merge rather than being responsible for merging results. The functions should have a return result of ISlotProps | undefined, these should be put in an array during token processing, then afterwards the framework should do a mergeSettings(renderData.slotProps, ...collectedTokenProps); The merge can handle null entries.

**Authors Shouldn't need to apply props to root**

The framework should merge props into root automatically, rather than relying on people to do it in the finalizer. This is too error prone. There should also be an automatic removal of token props. I would probably shift the workflow as follows:

1. Because renderData.props are mutable, add tokens from the slotProps to renderData.props instead of creating a separate collector array.
1. If the renderData.props already has a token value, don't overwrite it, simply mark that as a token key for caching.
1. Use props as the input for token routines
1. After the token routines, delete keys in the token mask from props
1. Apply props to root before the finalizer runs, or maybe after to avoid extra merging.
1. Finalizer should probably also switch to a fragment

**Names Should Be Aligned**

Right now the names are kind of all over the place in IComponent. The settings/tokens/finalizer/render should have a more unified naming schema.

**Should be easier to specify tokens**

Some ideas:

- make a helper function that returns the right object type
- allow a single or array, just convert to an array during compose
- create wrapper functions for standard processors that create a closure to specify the right thing,

something like:

    const Button = compose({
      className: 'RNFButton',
      tokens: {
        standardBackgroundTokens('root'),
        standardForegroundTokens('content', 'icon'),
        standardTextTokens('content'),
        buttonExtraStuffNotReallyTheNameButYouGetTheIdea(),
      }
    });

This way we leverage the array capabilities and avoid having to write as much code for each author. No need for a custom function if the processing is standard. You just have to write the slot target.
