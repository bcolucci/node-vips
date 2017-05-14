import R from 'ramda'

const TEXT_TAGNAME = 'text'
const INLINE_NODES = [ 'b', 'big', 'em', 'font', 'i', 'strong', 'u', TEXT_TAGNAME ]
const ONLY_DIGITS = /[0-9\.]+/g

const defaultEmptyArray = R.defaultTo([])

export const isNotEmpty = R.compose(R.not, R.isEmpty)
export const isNotEqual = R.compose(R.not, R.equals)
export const tagName = R.compose(R.toLower, R.defaultTo(TEXT_TAGNAME), R.prop('tagName'))
export const isInlineNode = R.compose(INLINE_NODES.includes.bind(INLINE_NODES), tagName)
export const isLineBreakNode = R.compose(R.not, isInlineNode)
export const emptyTextNodeFilter = R.filter(R.either(
  R.compose(R.not, R.equals(TEXT_TAGNAME), tagName),
  R.compose(R.not, R.isEmpty, R.trim, R.prop('textContent'))
))

const rawNodeChildren = R.compose(emptyTextNodeFilter, Array.from, defaultEmptyArray, R.prop('childNodes'))
const recursiveChildrenToArray = R.ifElse(
  R.compose(R.isEmpty), R.always([]),
  R.reduce((acc, n) => acc.concat(n).concat(nodeChildren(n)), [])
)
export const nodeChildren = R.compose(recursiveChildrenToArray, rawNodeChildren)

export const hasOnlyOneChild = R.compose(R.equals(1), R.length, nodeChildren)
export const firstChild = R.compose(R.head, nodeChildren)
export const isRawTextNode = R.compose(R.equals(TEXT_TAGNAME), tagName)
export const firstChildIsTextNode = R.compose(isRawTextNode, firstChild)
export const isTextNode = R.both(hasOnlyOneChild, firstChildIsTextNode)

const isNotZero = R.compose(R.not, R.equals('0'))
const onlyDigits = R.match(ONLY_DIGITS)
export const isNumericStylePropertyIsZero = (style) => (prop) => {
  const propValue = style.getPropertyValue(prop)
  return isNotZero(R.compose(R.head, defaultEmptyArray)(onlyDigits(propValue)))
}

export const isVisible = (getComputedStyle) => (node) => {
  const style = getComputedStyle(node)
  const isStyleIsZero = isNumericStylePropertyIsZero(style)
  return R.all(R.equals(true), [
    isNotEqual(style.getPropertyValue('visibility'), 'hidden'),
    isNotEqual(style.getPropertyValue('display'), 'none'),
    isStyleIsZero('opacity'),
    isStyleIsZero('width'),
    isStyleIsZero('height')
  ])
}

export const isValidNode = isVisible
export const isInvalidNode = R.compose(R.not, isValidNode)

export const isVirtualTextNode = (node) => {
  if (! isInlineNode(node)) {
    return false
  }
  const children = nodeChildren(node)
  if (! children.length) {
    return isRawTextNode(node)
  }
  const isRawOrVirtualTextNode = (node) => R.or(isRawTextNode(node), isVirtualTextNode(node))
  return R.all(isRawOrVirtualTextNode)(children)
}

export const contains = (tag) => R.compose(R.any(R.compose(R.equals(tag), tagName)), nodeChildren)

export const isBrokenInlineNode = (node) => {
  const childrenTags = R.compose(R.map(tagName), nodeChildren)(node)
  return R.any((tag) => ! R.contains(tag, INLINE_NODES))(childrenTags)
}
