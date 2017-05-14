import test from 'ava'
import parse from './parse'
import * as vips from './vips'

test((t) => parse('<b/>').then(({ root }) => {
  t.true(vips.isInlineNode(root))
  t.false(vips.isLineBreakNode(root))
}))

test((t) => parse('<p/>').then(({ root }) => {
  t.false(vips.isInlineNode(root))
  t.true(vips.isLineBreakNode(root))
}))

test((t) => parse('<span>text one</span>').then(({ root }) => {
  t.true(vips.isTextNode(root))
}))

test((t) => parse('<span>text <i>two</i></span>').then(({ root }) => {
  t.false(vips.isTextNode(root))
}))

test((t) => parse(`
  <p>
    <span id="visible1"/>
    <span id="visible2" style="opacity:0.2"/>
    <span id="hidden1" style="visibility:hidden"/>
    <span id="hidden2" style="display:none"/>
    <span id="hidden3" style="width:0"/>
    <span id="hidden4" style="height:0px"/>
    <span id="hidden5" style="opacity:0"/>
  </p>
`).then(({ getComputedStyle, getElementById }) => {
  const isVisible = vips.isVisible(getComputedStyle)
  t.true(isVisible(getElementById('visible1')))
  t.true(isVisible(getElementById('visible2')))
  t.false(isVisible(getElementById('hidden1')))
  t.false(isVisible(getElementById('hidden2')))
  t.false(isVisible(getElementById('hidden3')))
  t.false(isVisible(getElementById('hidden4')))
  t.false(isVisible(getElementById('hidden5')))
}))

test((t) => parse('text node').then(({ root }) => {
  t.deepEqual(vips.nodeChildren(root), [])
}))

test((t) => parse(`
  <div>
    <article>first article</article>
    <hr/>
    <article>second <em>article</em></article>
  </div>
  `).then(({ root }) => {
    const tags = vips.nodeChildren(root).map(vips.tagName)
    t.deepEqual(tags, [ 'article', 'text', 'hr', 'article', 'text', 'em', 'text' ])
}))

test((t) => parse('this is a virtual node (1)').then(({ root }) => {
  t.true(vips.isVirtualTextNode(root))
}))

test((t) => parse('<b>this is a virtual node (2)</b>').then(({ root }) => {
  t.true(vips.isVirtualTextNode(root))
}))

test((t) => parse('<b>this is a <em>virtual node</em> (3)</b>').then(({ root }) => {
  t.true(vips.isVirtualTextNode(root))
}))

test((t) => parse('<b>this is NOT a <span>virtual</span> node</b>').then(({ root }) => {
  t.false(vips.isVirtualTextNode(root))
}))

test((t) => parse('<p>this does not contains a <b>HR</b> tag</p>').then(({ root }) => {
  t.false(vips.contains('hr')(root))
}))

test((t) => parse(`
  <div>
    <p>this contains a <b>HR</b> tag, here:</p>
    <hr/>
  </div>
  `).then(({ root }) => {
  t.true(vips.contains('hr')(root))
}))

test((t) => parse(`
  <strong>
    Inline node without any line-break node
    <b>
      pretty sure there is no break here
      <font>hehe</font>
    </b>
    <i>see?</i>
  </strong>
  `).then(({ root }) => {
  t.false(vips.isBrokenInlineNode(root))
}))

test((t) => parse(`
  <strong>
    Inline node with a line-break node:
    <p>this is the line-break</p>
  </strong>
  `).then(({ root }) => {
  t.true(vips.isBrokenInlineNode(root))
}))
