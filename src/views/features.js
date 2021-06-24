import { spatial_abilities } from "../utils.js"

export default() => {
    var state_table = `
    <table id = "state-table" class='data'>
    <thead class='display'><tr>
    <th>State</th>
    <th>Coalition Builder</th>
    <th>Contiguity Checks</th>
    <th>Current District Boundaries</th>
    <th>Paint by County</th>
    <th>Tribal Nations</th>
    <th>Zoom to Unassigned Units</th>
    <th>Shapefile Export</th>
    <th>Block Groups</th>
    <th>Precincts/Wards</th></tr>
    </thead><tbody>`
    

    var other_table = `
    <table id = "other-table" class='data'>
    <thead class='display'><tr>
    <th>Jurisdiction</th>
    <th>Coalition Builder</th>
    <th>Contiguity Checks</th>
    <th>Current District Boundaries</th>
    <th>Paint by County</th>
    <th>Tribal Nations</th>
    <th>Zoom to Unassigned Units</th>
    <th>Shapefile Export</th>
    <th>Block Groups</th>
    <th>Precincts/Wards</th></tr>
    </thead><tbody>`
    
    recursive_table_builder(state_table, other_table, 0);

}
// couple useful globals
const available_states = [
    'Alabama','Alaska',
    'Arizona','Arkansas',
    'California','Colorado',
    'Connecticut','Delaware',
    'Washington, DC','Florida',
    'Georgia','Hawaii','Idaho',
    'Illinois','Indiana','Iowa',
    'Kansas','Kentucky','Louisiana',
    'Maine','Maryland','Massachusetts',
    'Michigan','Minnesota','Mississippi',
    'Missouri','Montana','Nebraska',
    'Nevada','New Hampshire','New Jersey',
    'New Mexico','New York','North Carolina',
    'North Dakota','Ohio','Oklahoma',
    'Oregon','Pennsylvania',
    'Puerto Rico','Rhode Island','South Carolina',
    'South Dakota','Tennessee','Texas','Utah',
    'Vermont','Virginia',
    'Washington','West Virginia',
    'Wisconsin','Wyoming'
]

const state_name_to_postal = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District of Columbia': 'DC',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY',
    'Washington, DC': 'DC',
    'Puerto Rico': 'PR'
}

function recursive_table_builder(state_table, other_table, index) {
    // base case, we are done!
    if (index + 1 > available_states.length) {
        // close tables
        state_table = state_table + "</tbody></table>"
        other_table = other_table + "</tbody></table>"

        // change the DOM
        let loading_message = document.getElementById('loading-msg');
        loading_message.remove();
        
        var state_table_container = document.getElementById('state-table-div');
        state_table_container.innerHTML = state_table;

        var other_table_container = document.getElementById('other-table-div');
        other_table_container.innerHTML = other_table;
        
        // DataTable constructor
        $(document).ready(function() {
            $('table.data').DataTable( {
                "scrollY":        "1200px",
                "scrollCollapse": true,
                "paging":         false,
                "scrollX":        true
            } );
        } );

        return;
    }

    // Recursive case, have to call the next state AFTER fetching
    const state = available_states[index];
    const str = state.concat(".json");
    fetch('../assets/data/modules/'.concat(str))
    .then(response => response.json())
    .then(data => {
            const rows = build_table_for_state(data, state);
            state_table = state_table + rows['state'];
            other_table = other_table + rows['other'];
            return recursive_table_builder(state_table, other_table, index + 1);
    });
}

const build_table_for_state = (data, state) => {
    const properties = ['coalition_builder', 'contiguity', 'current_districts', 'county_brush', 'native_american', 'find_unpainted', 'shapefile']
    var state_html = "";
    var other_html = "";

    for (const module of data) {
        const spatial = spatial_abilities(module['id']);
        
        var row = 
        (module['name'] == state) 
        ? '<tr><td>' + module['name'] 
        : '<tr><td>' + module['name'] + ', ' + state_name_to_postal[state];

        if (module['id'].substring(module['id'].length - 3) == "vra")
            row = row + " VRA";
        else if (["Wisconsin", "Puerto Rico", "Minnesota"].includes(state))
            row  = row + " (" + module['id'] + ")";

        row = row + '</td>';

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

        var units = {/**'blocks': "Not Available",**/ "blockgroups": "Not Available", "precincts": "Not Available"};
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
            var final = "";
            if (elections.length == 0)
                final = final + acc.substring(0, acc.length - 2);
            else
                final = final + acc + "Elections: " + elections.sort().join(', ');

            switch (unit['id']) {
                case 'blockgroups':
                    units['blockgroups'] = final;
                    break;
                //case 'blocks':
                    //units['blocks'] = final;
                    //break;
                case 'wards': // fall to precincts
                case 'precincts':
                    units['precincts'] = final;
                    break;
            }
        }

        // row = row + '<td>' + units['blocks'] + '</td>' 
        row = row + '<td>' + units['blockgroups'] + '</td>' 
        row = row + '<td>' + units['precincts'] + '</td>' 
        row = row + '</tr>';
        if (module['name'] == state)
            state_html = state_html + row;
        else 
            other_html = other_html + row;
    }
    return {'state': state_html, 'other': other_html}
}

function is_numeric(str){
    return /^\d+$/.test(str);
}