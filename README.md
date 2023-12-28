# har-cleaner

Library designed to clean sensitive data out of HAR files.

Built for, and used in [Securely](https://marketplace.atlassian.com/apps/1232593/securely-for-jira-har-file-cleaner-compliance-and-privacy) for Jira. Securely will scrub sensitive data out of HAR files attached to Jira.

Zero dependencies.

## Usage

Import the library into your code:

```js
import { sanitizeHar } from "har-cleaner";
```

Call the function with whatever options you want:

```js
scrubbedHar = sanitizeHar(harObject, {
    scrubAllCookies: options.scrubAllCookies,
    scrubSpecificCookie: options.scrubSpecificCookie,
    scrubAllRequestHeaders: options.scrubAllRequestHeaders,
    scrubSpecificHeader: options.scrubSpecificHeader,
    scrubAllResponseHeaders: options.scrubAllResponseHeaders,
    scrubSpecificResponseHeader: options.scrubSpecificResponseHeader,
    scrubAllQueryParams: options.scrubAllQueryParams,
    scrubSpecificQueryParam: options.scrubSpecificQueryParam,
    scrubAllPostParams: options.scrubAllPostParams,
    scrubSpecificPostParam: options.scrubSpecificPostParam,
    scrubAllBodyContents: options.scrubAllBodyContents,
    scrubSpecificMimeTypes: options.scrubSpecificMimeTypes
});
```

If you don't specify an option, then the library will use the relevant default value. Default values are defined in this block:

```js
const effectiveOptions = {
    scrubAllRequestHeaders: options?.scrubAllRequestHeaders || false,
    scrubAllCookies: options?.scrubAllCookies || false,
    scrubAllQueryParams: options?.scrubAllQueryParams || false,
    scrubAllPostParams: options?.scrubAllPostParams || false,
    scrubAllResponseHeaders: options?.scrubAllResponseHeaders || false,
    scrubAllBodyContents: options?.scrubAllBodyContents || false,
    scrubSpecificMimeTypes: options?.scrubSpecificMimeTypes || defaultMimeTypesList,
    scrubSpecificHeader: options?.scrubSpecificHeader || defaultRequestHeadersList,
    scrubSpecificCookie: options?.scrubSpecificCookie || defaultCookiesList,
    scrubSpecificQueryParam: options?.scrubSpecificQueryParam || defaultQueryPostParamsList,
    scrubSpecificPostParam: options?.scrubSpecificPostParam || defaultQueryPostParamsList,
    scrubSpecificResponseHeader: options?.scrubSpecificResponseHeader || defaultResponseHeadersList,
};
```

The various default word lists are defined in the file itself. These lists are based on Cloudflare's [har-sanitizer](https://github.com/cloudflare/har-sanitizer) library. However, we hope to evolve them to be option specific for clarity and performance reasons.

Default lists are exported so you can access them in other parts of your code easily via:

```js
import { defaultMimeTypesList, defaultRequestHeadersList } from 'har-cleaner';
```

### Allow vs Denylisting

This likely needs some better terminology and explanation, but the logic within the code allows for any given object to act in either allow or denylist mode. Let's walk through an example to make this easy to understand:

- You have a HAR file with a request header called Example. 
- If you set `scrubAllRequestHeaders` to true, and leave everything else alone, the Example header will be removed.
- If you set `scrubAllRequestHeaders` to true, and set `scrubSpecificHeader` to `['Example']` then everything other than Example will be removed.
- If you set `scrubAllRequestHeaders` to false, and leave everything else alone, the Example header will be left in place.
- If you set `scrubAllRequestHeaders` to false, and set `scrubSpecificHeader` to `['Example']` then only the Example header will be removed.

The same thing applies to the other matched options:

- scrubAllRequestHeaders <> scrubSpecificHeader
- scrubAllCookies <> scrubSpecificCookie
- scrubAllQueryParams <> scrubSpecificQueryParam
- scrubAllPostParams <> scrubSpecificPostParam
- scrubAllResponseHeaders <> scrubSpecificResponseHeader
- scrubAllBodyContents <> scrubSpecificMimeTypes

## Licensing

This software is dual licensed under an AGPL license plus a commercial license. If you would like to use this in your software without complying with the AGPL license please contact us.

## Collaborating

Since this software is dual licensed under AGPL and a commercial license, any external contributions will be asked to sign a CLA.

## Quality

This is our first time releasing a library and we're still learning how to do this. Please be kind and provide constructive criticism.
