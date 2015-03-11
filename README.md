# lorem-ipsum-tag

Stop cluttering up your markup.

## install
```npm install lorem-ipsum-tag```

## use
```
<!--polyfill-->
<script src='node_modules/webcomponents.js/webcomponents.min.js'></script>
<!-- import component -->
<link rel='import' href='node_modules/lorem-ipsum-tag/lorem-ipsum.html'>

<lorem-ipsum count=1 units='paragraph' format='html'></lorem-ipsum>
```

The text is generated with [knicklabs](https://github.com/knicklabs) [lorem-ipsum module](https://github.com/knicklabs/lorem-ipsum.js), and rendered inside a `<lorem-ipsum>` tag.

## <a name='attributes'></a>attributes

`units=<'word' | 'sentence' | 'paragraph'>`
  Whether to render words, sentences, or paragraphs.
  default: `paragraph`,
`count=1`
  The number of units to render.
  default: `1`,
`format=<'html' | 'text'>`
  If `units='paragraph'` and `format='html'`, each paragraph of text will be wrapped in `<p>...</p>` tags. If `format='text'`.

## methods

`.render()`
  Asynchronously generates the text using the default generator in the [lorem-ipsum module](https://github.com/knicklabs/lorem-ipsum.js), and renders it within the `lorem-ipsum` element. Defaults not currently specified above under [attributes](#attributes) are as described in the documentation for that module. Multiple calls to `.render()` may be made before the text is actually rendered; the attributes of the element at the time of the most recent call determine the final rendering. Uncomment the lines indicated in the screenshot below to test this for yourself:

  ![perf.png](https://raw.githubusercontent.com/phoenixstormcrow/lorem-ipsum-tag/master/perf.png)
