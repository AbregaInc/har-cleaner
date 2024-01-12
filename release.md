Based on https://cloudfour.com/thinks/how-to-publish-an-updated-version-of-an-npm-package/

```
git pull
git status
npm ci
npm test
npm run build
npm version minor/major
npm publish
git push
git tag 0.0.X
git push --tags
```