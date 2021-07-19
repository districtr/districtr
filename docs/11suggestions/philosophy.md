# A View on Code

Even after the MBTA Green Line is completed through Tufts, the Davis Red
Line stop will remain the most direct way to connect Sommerville with
MIT, four stops away before the Charles River crossing. Thirty-five
years ago, in long-gone Building 20, Harold Abelson and Gerald Jay
Sussman wrote the _Structure and Interpretation of Computer Programs_.
Though often attributed to the legendary Donald Knuth, they prefaced
that... 

> “Programs are meant to be read by humans and only incidentally for
computers to execute.”

Since the time of punchcards, rapid development and the satisfaction of
stakeholders has often been the first priority. Together with the
privlege of the time to review districr's codebase, I make suggestions
with the following guidelines. Promoting clearer code will make
development and debugging easier as MGGG scales. The docs are these
suggests were written for with successive generations of bright
developers in mind. May they share the same dedication to democracy,
imbued in every line of code, as those before them.

### Documentation!

The foundation of readable code is proper commenting and documentation.
It is a chore to write out arguments and their types, return types
(including null returns), and the function of every instance and
internal method and function. However, the time spent writing this out
is an investment in avoiding repeated code, repeated questions, and
repeated tracing of code. 

Since code is read more often than it is written, I'm partial to
over-commenting and writing lines out rather than compact code and
anonymous functions.

### Structures by the Handful

Just as a number contains only between 7-10 numbers, functions whose
scope only covers a handful of 7-10 easy to understand tasks. Anything
requiring more detail, including callback functions, should be written
out. The results are levels of function, each with a collection of 7-10
concepts. Functions more than three levels of depth are rarely required.

### A Single Return 

It is easier to read code if starts and ends at a single return
statement. It is a common style to escape a function given conditions,
but that makes it harder to follow when code is or isn't executed.
Even nested if statements, together with levels of functions, make code
far more readible.

Perhaps heretically, I think it's important to make a return statement
even if the function returns nothing. A null return statement is not
redundant; it shows that the function is consistent with the promises
it makes in the documentation.

### Complete Initialization

When an object is initialized, a complete list of its instance variables
should be taken into account with a default value, even (especially) if
it starts null. This makes the development of models faster because it
helps us understand the scope of our changes without having to trace all
over the code. This is difficult as old objects are made to perform new
tricks, but the benefits of well considered objects makes it easier to
conceptualize the pieces of the whole. 

## Deprecation

Many custom and experimental features arise due to requests from
organizations and states. Indeed, districtr must take account of the
preponderance of states, counties, municipalities and their varieties of
policies, data and needs.

However as better features and methods arise, we have to prune the plant
to help newer branches grow stronger. It's very difficult to trace
through parallel ways to achieve a feature when only one method won out.
Thus, old pieces of code must be culled. 

If those pieces of code were already well documented, then the code can
be ressurrected easily, as needed. Good documentenation ensures that
snippets of code are modularized, that is, easy to plug in and out of
the code base. 

Even today, all code committed by github is preserved for review. Thus,
a production quality codebase should be kept lean.

## Stories

It's important to add personality to the code by recalling the stories
woven in the code by coders in the past. From this history, we can learn
how old obstacles were overcome and exposes us how different types of
creativity solving problems. Learning the history of the features of the
code also helps us identify the core of a feature, the ways it is used
and helps us copy clever solutions and imagine better ways of issuing a
feature. 

In short, as new people arrive, they can find themselves in the story of
districtr and synchronize themselves with established patterns. 

# # 

[Return to Main](../README.md)
- Next: [Deprecations and Experimental Features](../11suggestions/deprecations.md)
- [Clarifying Operations](../11suggestions/clarity.md)
- [Logical Redundancies](../11suggestions/logic.md)
- [Organization](../11suggestions/organizing.md)
- [The Heavy Lift: (Not) Global Objects](../11suggestions/globalobjects.md)
- [Other Notes](../11suggestions/other.md)

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA