# in .Rprofile of the website project
if (file.exists("~/.Rprofile")) {
  base::sys.source("~/.Rprofile", envir = environment())
}

options(
        blogdown.generator = "hugo",
        #blogdown.method = "custom",
        blogdown.new_bundle = FALSE,       # force making page bundle (i.e folder instead of single file)
        blogdown.author = "John",          # Who the author of posts is
        blogdown.ext = '.Rmd',             # File extension for posts
        blogdown.subdir	 = "post"         # subfolder for posts to be placed in
)

# Make sure to end the file in an empty line
