import test from 'ava'
import parse from './parse'
import * as vips from './vips'

test(t => parse('<b/>').then(({ root }) => t.true(vips.isInlineNode(root) && ! vips.isLineBreakNode(root))))
test(t => parse('<p/>').then(({ root }) => t.true(! vips.isInlineNode(root) && vips.isLineBreakNode(root))))
test(t => parse('<span>text one</span>').then(({ root }) => t.true(vips.isTextNode(root))))
test(t => parse('<span>text <i>two</i></span>').then(({ root }) => t.false(vips.isTextNode(root))))

test(t => parse(`
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

test(t => parse('text node').then(({ root }) => t.deepEqual(vips.nodeChildren(root), [])))

test(t => parse(`
  <div>
    <article>first article</article>
    <hr/>
    <article>second <em>article</em></article>
  </div>
  `).then(({ root }) => {
    t.deepEqual(vips.nodeChildren(root).map(vips.tagName), [ 'article', 'text', 'hr', 'article', 'text', 'em', 'text' ])
}))

test(t => parse('<span>this is a <em>virtual <i>node</i></em></span>').then(({ root }) => {
  vips.isVirtualTextNode(root)
}))
