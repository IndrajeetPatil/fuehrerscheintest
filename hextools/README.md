# hextools

This folder contains the R script used to generate the `fuehrerscheintest`
hex sticker logo.

## Generating the logo

The sticker artwork is `data.svg`, an original vector drawing of a bilingual
question card in the app's palette: the warning triangle from the favicon and
two answers ticked in the teal accent, since a question can have several
right answers. To regenerate the logo:

1. **Install R dependencies**:

   ```r
   install.packages(c("hexSticker", "magick", "showtext"))
   ```

2. **Run the script** from the repository root:

   ```bash
   Rscript hextools/script.R
   ```

   The generated logo is written to `docs/images/logo.png`.
