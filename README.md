# nudel

nudel is a public jam space, made by [pastagang](https://www.pastagang.cc/)

**join at [nudel.cc](https://nudel.cc)**

everyone is in the same room. anyone is encouraged to join in!\
tip: press alt + enter to run code.

## background

nudel was born out of [curiosity](https://post.lurk.org/@TodePond@mas.to/113739106696182239), to see if flok could be treated as a protocol, where different web clients access the same session. the default frontend for flok is [flok.cc](https://flok.cc/), which supports a lot of live coding languages both web and native, and it's awesome. the first version of nudel was based on the [flok vanilla js example](https://github.com/munshkr/flok/tree/main/packages/example-vanilla-js) and has since then been actively developed by several people around [pastagang](https://www.pastagang.cc/). the site will always point to the "pastagang" room, maximizing the chance for a jam to start.

## contributing

everyone can change nudel

**all changes get accepted**

to become an admin of nudel, [create an issue](https://github.com/pastagang/nudel/issues/new/choose) and ask to get added.

<br>

let's aim to be hierarchy free, so anyone is welcomed to change things they see fit.\
let's _not_ have a [bdfl](https://en.wikipedia.org/wiki/Benevolent_dictator_for_life), or a small group of people having the last say.\
either create a PR, or push directly to main, both is fine.\
this project has been born out of a jam session, so let's carry that ethos into the code behind the [jam](https://pastagang.cc/paper).

<br>

# Technical stuff

welcome to the spaghetti of nudel

## what nudel is made of

nudel a mashup of existing free & open source projects:

- [flok](https://github.com/munshkr/flok/) for collab coding
- [strudel](https://github.com/tidalcycles/strudel) for sound
- [hydra](https://github.com/hydra-synth/hydra-synth) for visuals
- [kabalsalat](https://kabel.salat.dev/) for ???

if you enjoy nudel, consider donating to [flok](https://ko-fi.com/munshkr) / [strudel](https://opencollective.com/tidalcycles) / [hydra](https://opencollective.com/hydra-synth)

## running locally

0. make sure you have [node.js](https://nodejs.org/en/download) installed
1. clone the project
2. run `npm i` (you can also use `pnpm`)
3. run `npm run dev`

if you need to, disconnect your environment from the public nudel by changing the hostname to 'localhost' in the main.js. but maybe you shouldn't because nudel is a place, and the maintenance workers can also be seen while people jam?

## publishing

any changes to `main` will be deployed immediately to [nudel.cc](https://nudel.cc).

if you break something, that's ok. (we can use [todepond.cool/flok](https://www.todepond.cool/flok) as a backup)

<!--

## flok compatibility

it would be good to stay compatible to flok.cc (and potential other clients), so that people could choose their client.\
by compatible, i mean the overlapping features should behave similarly, and features that do not overlap should not cause problems.

-->
