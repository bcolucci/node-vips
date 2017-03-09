import R from 'ramda'

const INLINE_NODES = [ 'b', 'big', 'em', 'font', 'i', 'strong', 'u' ]
const TEXT_TAGNAME = 'text'
const ONLY_DIGITS = /[0-9\.]+/g

export const isNotEmpty = R.compose(R.not, R.isEmpty)
export const isNotEqual = R.compose(R.not, R.equals)
export const tagName = R.compose(R.toLower, R.defaultTo(TEXT_TAGNAME), R.prop('tagName'))
export const isInlineNode = R.compose(INLINE_NODES.includes.bind(INLINE_NODES), tagName)
export const isLineBreakNode = R.compose(R.not, isInlineNode)
export const emptyTextNodeFilter = R.filter(R.either(
  R.compose(R.not, R.equals(TEXT_TAGNAME), tagName),
  R.compose(R.not, R.isEmpty, R.trim, R.prop('textContent'))
))
export const nodeChildren = (node) => {
  const children = R.compose(emptyTextNodeFilter, Array.from, R.prop('childNodes'))(node)
  return R.ifElse(R.compose(R.isEmpty), R.always([]), R.reduce((acc, n) => acc.concat(n).concat(nodeChildren(n)), []))(children)
}
export const hasOnlyOneChild = R.compose(R.equals(1), R.length, nodeChildren)
export const firstChild = R.compose(R.head, nodeChildren)
export const firstChildIsTextNode = R.compose(R.equals(TEXT_TAGNAME), tagName, firstChild)
export const isTextNode = R.both(hasOnlyOneChild, firstChildIsTextNode)

export const isNumericStylePropertyIsZero = (style, prop) => {
  return R.compose(R.not, R.equals('0'))(R.compose(R.head, R.defaultTo([]))(style.getPropertyValue(prop).match(ONLY_DIGITS)))
}

export const isVisible = getComputedStyle => node => {
  const style = getComputedStyle(node)
  return R.all(R.equals(true), [
    isNotEqual(style.getPropertyValue('visibility'), 'hidden'),
    isNotEqual(style.getPropertyValue('display'), 'none'),
    isNumericStylePropertyIsZero(style, 'opacity'),
    isNumericStylePropertyIsZero(style, 'width'),
    isNumericStylePropertyIsZero(style, 'height')
  ])
}

export const isValidNode = isVisible
export const isInvalidNode = R.compose(R.not, isValidNode)

// inline node with only text node children is a virtual text node
// or inline node with only text node and virtual text node children is a virtual text node
export const isVirtualTextNode = (node) => {
  const children = nodeChildren(node)
  console.log(children)
  //TODO
}
