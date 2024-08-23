---
author: John Hall
format:
  gfm:
    variant: +yaml_metadata_block
---


About this site

``` r
data_dir <- "data"

if (grepl(paste0("/", data_dir, "$"), getwd(), ignore.case = TRUE, perl = TRUE)) {
  print(paste0(data_dir, " is the current working directory"))
  data_dir <- stringr::str_replace(getwd(), "/data", "")
} else {
  data_dir <- paste0(getwd(), "/", data_dir)
}
if (!dir.exists(data_dir)) {
  dir.create(data_dir)
  print(paste0(data_dir, " was created"))
}
```
