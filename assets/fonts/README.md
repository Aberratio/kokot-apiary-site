# Fonts

Both families are free under the SIL Open Font License 1.1 (`OFL-Fraunces.txt`, `OFL-InstrumentSans.txt`). The files come from the Google Fonts CSS API and are self-hosted through `next/font/local` in `src/app/(site)/[lang]/layout.tsx`.

| File                                 | Used for                    | Instance                                         |
| ------------------------------------ | --------------------------- | ------------------------------------------------ |
| `Fraunces-144pt-Soft-SemiBold.woff2` | Headings, brand, hero title | Fraunces, `opsz` 144, `SOFT` 100, weight 600     |
| `InstrumentSans-wght.woff2`          | Body text                   | Instrument Sans, variable weight 400–700         |
| `Fraunces-144pt-Soft-SemiBold.ttf`   | Open Graph image            | Same Fraunces instance, full character set (TTF) |

## Why self-hosted single files

The hero title is the page's Largest Contentful Paint. The page already requests its fonts before the title paints (headings further down use Polish letters), and Lighthouse's mobile simulation counts every one of those bytes on a slow connection. Loading Fraunces through `next/font/google` with its `SOFT` and `opsz` axes and the `latin-ext` subset meant 221 KB of Fraunces alone and a simulated LCP about a second later. Pinning the axes and keeping one file per family with only the characters the site needs brings both fonts to 50 KB, close to the 45 KB of the previous font.

## Character set

Each WOFF2 holds Basic Latin (U+0020–007E), Latin-1 (U+00A0–00FF), the Polish letters `ąćęłńóśźżĄĆĘŁŃÓŚŹŻ` and `–—‘’‚“”„…«»‹›•€№`. Text from the CMS outside that set falls back to Georgia (headings) or the system sans (body).

## Regenerating

Request the CSS with a browser user agent and the `text` parameter set to the character set above, then download the single `url(...)` it lists:

```text
https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@144,600,100&text=<characters>
https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&text=<characters>
```

For the TTF, request `family=Fraunces:opsz,wght,SOFT@144,600,100` without `text`, with a user agent that does not support WOFF2 (for example `curl`'s default).
