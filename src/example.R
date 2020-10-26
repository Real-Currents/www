mean(1 : 5)
mean(c(1, 3, 5, 4, 3))
median(1 : 5)
median(c(1, 3, 5, 4, 3))
sum(1 : 5)
sum(c(1, 3, 5, 4, 3))

Sys.getenv("R_HOME")
candidates <- c( file.path(Sys.getenv("R_HOME"), "etc", "Rprofile.site"),
                 file.path(Sys.getenv("R_HOME"), "etc", "Rprofile"),
                 file.path(Sys.getenv("R_HOME"), "library", "base", "R", "Rprofile") )
#                 Sys.getenv("R_PROFILE_USER") )
#                 Sys.getenv("R_PROFILE"),
#                 file.path(getwd(), ".Rprofile") )
Filter(file.exists, candidates)
