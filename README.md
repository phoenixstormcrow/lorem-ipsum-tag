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

## attributes

`units`: `'word' | 'sentence' | 'paragraph'`
`count=1` The number of
