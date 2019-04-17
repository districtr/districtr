export function renderAboutModal() {
    const target = document.getElementById("modal");
    const template = html`
        <div class="modal-wrapper" @click="${() => render("", target)}">
            <div class="modal-content">
                <h2>Lowell, MA</h2>
                <p>
                    The units you see here are the 1,845 census blocks that make
                    up the municipality of Lowell, MA.
                </p>
                <p>
                    Data for this module was obtained from the US Census Bureau.
                    The block shapefile for the city of Lowell was downloaded
                    from the
                    <a
                        href="https://www.census.gov/geo/maps-data/data/tiger-line.html"
                        >Census's TIGER/Line Shapefiles</a
                    >. Demographic information from the decennial Census was
                    downloaded at the block level from
                    <a
                        href="https://factfinder.census.gov/faces/nav/jsf/pages/index.xhtml"
                        >American FactFinder</a
                    >.
                </p>

                <p>
                    The cleaned shapefile with demographic information is
                    <a
                        href="https://github.com/gerrymandr/Districtr-Prep/tree/master/Lowell"
                        >available for download</a
                    >
                    from the MGGG GitHub account.
                </p>
            </div>
        </div>
    `;
    render(template, target);
}
