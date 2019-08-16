# slack-logger


```js
const log = new SlackLogger('YOUR_TOKEN');

log.raw('simple text message');

log.error(new Error('err happened'));

log.message('friendly message from the app');
```
