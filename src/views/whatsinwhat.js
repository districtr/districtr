import { spatial_abilities } from "../utils.js"

export default() => {
    const elt = document.getElementById("choice");
    elt.addEventListener("change", function () {
        get_json_file(elt.value);
    });
}

const get_json_file = (state) => {
    var str = state.concat(".json");
    fetch('../assets/data/modules/'.concat(str))
    .then(response => response.json())
    .then(data => build_table(data, state));
}

const build_table = (data, state) => {
    var html = `
        <table class='data'><tbody><tr>
        <th>Module</th>
        <th>Coalition Builder</th>
        <th>Contiguity Checks</th>
        <th>Current District Boundaries</th>
        <th>Paint by County</th>
        <th>Tribal Nations</th>
        <th>Zoom to Unassigned Units</th>
        <th>Blocks</th>
        <th>Block Groups</th>
        <th>Precincts/Wards</th></tr>`
        

    const properties = ['coalition_builder', 'contiguity_checks', 'current_districts', 'county_brush', 'native_american', 'find_unpainted']
    
    // makes the statewide module appear first
    var statewide;
    for (const i in data) {
        const name = data[i]['name'];
        if (name == state) {
            statewide = i;
            break;
        }
    }
    data.splice(0, 0, data.splice(statewide, 1)[0]);
    
    for (const module of data) {
        const spatial = spatial_abilities(module['id']);
        var row = '<tr><td>' + module['name'] + '</td>';
        // First do properties
        for (const p of properties) {
            // deal with coalition builder differently since it is opt out
            if (p == 'coalition_builder') {
                if (p in spatial)
                    row = row + '<td>❌</td>'; 
                else
                    row = row + '<td>✅</td>'; 
                continue;
            }

            // for all others
            if (p in spatial)
                row = row + '<td>✅</td>';
            else
                row = row + '<td>❌</td>';
        }
        // TODO do the data layers
        //    sort out the string comprehensions
        //    "not available"

        var units = {'blocks': "Not Available", "blockgroups": "Not Available", "precincts": "Not Available"};
        for (const unit of module['units']) {
            var acc = ""
            var elections = []
            for (const c of unit['columnSets']) { 
                var col_name = c['name'];
                // some error checking bc things are not standardized
                if (!('name' in c)) {
                    col_name = c['metadata']['year'].toString();
                }
                // if c is an election result
                if (is_numeric(col_name.substring(0, 4))) {
                    if (!elections.includes(col_name.substring(0, 4)))
                        elections.push(col_name.substring(0, 4));
                }
                else
                    acc = acc + col_name + ', ';
            }

            // final formatting
            var final;
            if (elections.length == 0)
                final = acc.substring(0, acc.length - 2);
            else
                final = acc + "Elections: " + elections.join(', ');

            switch (unit['id']) {
                case 'blockgroups':
                    units['blockgroups'] = final;
                    break;
                case 'blocks':
                    units['blocks'] = final;
                    break;
                case 'wards': // fall to precincts
                case 'precincts':
                    units['precincts'] = final;
                    break;
            }
        }

        row = row + '<td>' + units['blocks'] + '</td>' 
        row = row + '<td>' + units['blockgroups'] + '</td>' 
        row = row + '<td>' + units['precincts'] + '</td>' 
        row = row + '</tr>';
        html = html + row;
    }
    var table_container = document.getElementById('table-div');
    table_container.classList.add('table-container');
    table_container.innerHTML = html;
}

function is_numeric(str){
    return /^\d+$/.test(str);
}