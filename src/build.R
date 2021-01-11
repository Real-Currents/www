if (!require("blogdown")) {
    devtools::install_version("blogdown",  version = "0.20")
    library(blogdown)
    blogdown::install_hugo()
}
blogdown::build_site()
