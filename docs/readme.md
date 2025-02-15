# nudel docs

this is the beginning of an attempt to write some docs for nudel

maybe i'll start by at least outline the special nudel functions

## nudel library

all of the editors in nudel have access to the nudel library. the nudel library contains some helpful things that might help you get around some of nudel's restrictions (eg: no pasting).

### `hubda`

A quicker way of importing samples from a github repo.

```js
hubda('eddyflux/crate')

$: s("bd sd")
.bank("crate")
```

```js
hubda('eddyflux/wax')

$: s("atmosphere")
```

(replace `eddyflux` and `crate` with the repo owner and name)


### `speechda`

A quicker way of generating text-to-speech using shabda.

```js
speechda('hello world')

$: s("hello world")
```

you can specify what kind of voice to use. all of these lines do the same thing. 

```js
speechda('fr-FR/m:hello world')
speechda("hello world", "fr-FR", "m")
speechda("hello world", "fr-FR/m")
```

todo: the other stuff

