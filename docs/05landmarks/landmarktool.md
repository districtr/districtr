# The Old Landmark Tool

Per [`edit.js`], [`ToolsPlugin`] is always created with the [`Editor`],
and within this plugin, `LandmarkTool` is called with the [`State`] as
an argument. 

Recently, however, in March 2021, it appears that much of the
`LandmarkTool`'s funtionality has been distributed to the
[`community-plugin`] and the [`Landmark`] class. It is called in
`community-plugin` but not assigned.

It creates an extra pair of `Landmark` and `LandmarkOptions` instance
methods, but since the instance is never assigned, it is never called.
We can see in the old render function traces of old buttons and lists,
but that today, it is rendred by `community-plugin` for the `Toolbar`.

# # 

[Return to Main](../README.md)
- [Communities of Interests in Use](./05landmarks/coi.md)
- [The Landmark Class](./05landmarks/landmarksclass.md)
- Previous: [The Community Plugin](./05landmarks/communityplugin.md)
- Next: [My COI](./05landmarks/mycoi.md)
- [Finding Places](./05landmarks/findplaces.md)


[`State`]: ../01contextplan/state.md

[`edit.js`]: ../02editormap/editor.md
[`Editor`]: ../02editormap/editor.md

[`ToolsPlugin`]: ../03toolsplugins/toolsplugin.md
[`Toolbar`]: ../03toolsplugins/toolbar.md

[`community-plugin`]: ../05landmarks/communityplugin.md
[`Landmark`]: ../05landmarks/landmarksclass.md


# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA