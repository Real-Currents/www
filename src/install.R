if (!require("blogdown")) {
    install.packages("devtools")
    devtools::install_version("blogdown",  version = "0.20", update = "never")
    library(blogdown)
    blogdown::install_hugo()
}
