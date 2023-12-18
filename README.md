# har-cleaner

Library designed to clean sensitive data out of HAR files.

Built for, and used in [Securely](https://marketplace.atlassian.com/apps/1232593/securely-for-jira-har-file-cleaner-compliance-and-privacy) for Jira. Securely will scrub sensitive data out of HAR files attached to Jira.

## Usage

Import the library into your code:

```
import { sanitizeHar } from "har-cleaner";
```

Call the function with whatever options you want:

```
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

```
const effectiveOptions = {
    scrubAllRequestHeaders: options?.scrubAllRequestHeaders || false,
    scrubAllCookies: options?.scrubAllCookies || false,
    scrubAllQueryParams: options?.scrubAllQueryParams || false,
    scrubAllPostParams: options?.scrubAllPostParams || false,
    scrubAllResponseHeaders: options?.scrubAllResponseHeaders || false,
    scrubAllBodyContents: options?.scrubAllBodyContents || false,
    scrubSpecificMimeTypes: options?.scrubSpecificMimeTypes || defaultMimeTypesList,
    scrubSpecificHeader: options?.scrubSpecificHeader || defaultWordList,
    scrubSpecificResponseHeader: options?.scrubSpecificResponseHeader|| defaultWordList,
    scrubSpecificPostParam: options?.scrubSpecificPostParam || defaultWordList,
    scrubSpecificCookie: options?.scrubSpecificCookie || defaultWordList,
    scrubSpecificQueryParam: options?.scrubSpecificQueryParam || defaultWordList,
};
```

`defaultWordList` and `defaultMimeTypeList` are defined in the file itself. These lists are based on Cloudflare's [har-sanitizer](https://github.com/cloudflare/har-sanitizer) library. However, we hope to evolve them to be option specific for clarity and performance reasons.

Default lists are exported so you can access them in other parts of your code easily via:

```
import { defaultMimeTypesList, defaultWordList } from 'har-cleaner';
```

## Licensing

This software is dual licensed under an AGPL license plus a commercial license. If you would like to use this in your software without complying with the AGPL license please contact us.

## Collaborating

Since this software is dual licensed under AGPL and a commercial license, any external contributions will be asked to sign a CLA.

## Quality

This is our first time releasing a library and we're still learning how to do this. Please be kind and provide constructive criticism.