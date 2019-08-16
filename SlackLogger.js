/**
 * Slack Logger
 * @author skitsanos
 * version 1.1.0
 */
class ajx
{
    constructor(url = 'http://localhost:3000', withCredentials = false)
    {
        this.url = url;
        this.xhr = new XMLHttpRequest();
        this.xhr.withCredentials = withCredentials;

        this.headers = new Map();
    }

    post(data)
    {
        const _that = this;
        return new Promise((resolve, reject) =>
        {
            this.xhr.onreadystatechange = () =>
            {
                if (_that.xhr.readyState === XMLHttpRequest.DONE)
                {
                    if (_that.xhr.status >= 200 && _that.xhr.status < 300)
                    {
                        try
                        {
                            const json = JSON.parse(_that.xhr.responseText);
                            resolve(json);
                        } catch (e)
                        {
                            resolve(_that.xhr.responseText);
                        }
                        resolve(_that.xhr);
                    }
                    else
                    {
                        reject({message: 'The request failed'});
                    }
                }
            };

            this.xhr.open('POST', this.url, true);

            //set headers
            this.headers.forEach((value, key) =>
            {
                this.xhr.setRequestHeader(key, value);
            });

            this.xhr.send(data);
        });
    }
}

class SlackLogger
{
    constructor(token)
    {
        this.channel = 'app-errors';
        this.token = token;
    }

    raw(payload)
    {
        return new Promise((resolve, reject) =>
        {
            const ajax = new ajx('https://slack.com/api/chat.postMessage');

            const data = new FormData();
            data.append('token', this.token);
            data.append('scope', 'chat:write:bot');
            data.append('channel', this.channel);

            if (typeof payload === 'string')
            {
                data.append('text', payload);
            }
            else
            {
                if (payload.text)
                {
                    data.append('text', payload.text);
                }
                //if there any attachments
                if (payload.attachments)
                {
                    data.append('attachments', JSON.stringify(payload.attachments));
                }
            }

            ajax.post(data)
                .then(response => resolve(response))
                .catch(err => reject(err));
        });
    }

    message(text, color = 'good')
    {
        this.raw({
            attachments: [
                {
                    text,
                    color
                }
            ]
        });
    }

    error(err)
    {
        const payload = {
            text: err.message,
            attachments:
                [
                    {
                        author_name: window.location.href,
                        color: 'danger',
                        title: 'Stack',
                        text: err.stack
                    }
                ]
        };

        this.raw(payload);
    }
}
