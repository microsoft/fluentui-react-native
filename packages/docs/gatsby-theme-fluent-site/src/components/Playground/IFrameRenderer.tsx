import * as React from 'react'
import * as ReactDOM from 'react-dom'

/**
 * Renders React children into an iframe.
 *
 * TODO: convert to hooks.
 */
export class IFrameRenderer extends React.Component {
  node: any
  _setInitialContent = false
  _mounted = false
  _rendered = false

  componentDidMount() {
    this._mounted = true

    const doc = this.getDoc()
    if (doc && doc.readyState === 'complete') {
      this.forceUpdate()
    } else {
      this.node.addEventListener('load', this.handleLoad)
    }
  }

  componentWillUnmount() {
    this._mounted = false
    this.node.removeEventListener('load', this.handleLoad)
  }

  getDoc() {
    return this.node && this.node.contentDocument
  }

  getMountTarget() {
    const doc = this.getDoc()
    return doc.getElementById('frame-root')
  }

  handleLoad = () => {
    this.forceUpdate()
  }

  renderIFrameContents() {
    if (!this._mounted) {
      return null
    }

    const doc = this.getDoc()
    if (!doc) {
      return null
    }

    if (!this._setInitialContent) {
      const styles = `
        html, body, #frame-root {
            margin: 0;
            height: 100vh;
            width: 100%;
        }

        #frame-root {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        `
      doc.write(`<!DOCTYPE html><html><head><style>${styles}</style></head><body><div id="frame-root"></div></body></html>`)
      doc.close()
      this._setInitialContent = true
    }

    const mountTarget = this.getMountTarget()
    const win = doc.defaultView || doc.parentView

    // Do not allow elements to be focused within the iframe
    win.HTMLElement.prototype.focus = () => {}

    const ctx = { window: win, document: doc }
    const content = this.props.children(ctx) || null
    return ReactDOM.createPortal(content, mountTarget)
  }

  render() {
    const { children, ...rest } = this.props
    return (
      <iframe
        title="Example Renderer"
        seamless
        ref={node => (this.node = node)}
        style={{
          height: '100%',
          width: '100%',
          border: 'none',
        }}
        {...rest}
      >
        {this.renderIFrameContents()}
      </iframe>
    )
  }
}
