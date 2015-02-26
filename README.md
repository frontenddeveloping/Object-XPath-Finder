# Object-XPath-Finder
Javascript library for using simple xPath for search in javascript objects

### XPath usage:
- `//key1` or `key1` - every value with `key1` in object, will return values of `key1`
- `/key1/key2` - search from root for `key1` value which has `key2` as a child, will return value of `key2`
- `key1//key2` - deep search for `key1` which has `key2`, will return values of `key2`
