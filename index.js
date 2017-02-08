var projects = {};
var nodes = {};

function connect() {

    var url = $('#database-url')[0].value;

    Weaver.connect(url).then(function() {

        console.log('successfully connected');
        $('#step-2').removeClass('disabled');
        $('#step-3').removeClass('disabled');

    }).catch(function(e) {
        console.log('error')
        console.log(e);
    })
}

function createProject() {

    var name = $('#create-project-name')[0].value;

    var project = new Weaver.Project(name);
    project.create().then(function(){
        project.save();
        projects[project.nodeId] = project;
        $('#step-3').removeClass('disabled');

    });
    populateProjectList([project])
}

function useProject() {

    var val = $('input:radio[name=choose-project]:checked').val();

    var proj = projects[val];

    Weaver.useProject(proj);

    $('#current-project-name').html(proj.attributes.name || 'Unnamed');
    $('#current-project-id').html(proj.nodeId);

    $('#step-4').removeClass('disabled');
    $('#step-5').removeClass('disabled');
    $('#step-6').removeClass('disabled');
    $('#step-7').removeClass('disabled');
    $('#step-8').removeClass('disabled');
    $('#step-9').removeClass('disabled');
}

function updateProjectList() {

    if(Weaver._connected) {
        Weaver.Project.list()
        .then(function (res) {
            populateProjectList(res)
        });
    }
}

function populateProjectList(projs) {
    var container = $('#project-list')
    var items = [];

    $.each(projs, function(i, item) {

        projects[item.nodeId] = item;

        items.push('<input name="choose-project" value="' + item.nodeId + '" type="radio"><span>' + (item.attributes.name || 'Unnamed <i>(id:' + item.nodeId + ')</i>') + '</span><br>');

    });  // close each()
    container.html(items.join(''))
}

function getNodeList() {

    projNode = Weaver.currentProject();
    proj = new Weaver.Project(projNode.id());
    proj.getAllNodes().then(function(res){
        $( "#created-node-list" ).html(res);
    });
}

function createNewNode(){

    var name = $('#create-node-name')[0].value;
    var id = $('#create-node-id')[0].value;

    if(id === '') {
        id = undefined;
    }

    var node = new Weaver.Node(id);

    if(name) {
        node.set('name', name);
    }
    node.save().then(function(){

        nodes[node.nodeId] = node;
        $('#created-node-list').append('<div class="created-node-container"><span class="created-node-name">' +
            (name || 'Unnamed') + '</span><span class="created-node-id">' + node.nodeId + '</span></div>')
    })
    $('#create-node-name').val(''); $('#create-node-id').val('');

}

function updateNodeList(){

    $.get( "http://localhost:9474/nodes?attributes=name", function( data ) {
        htmlString = ''
        for(var i in data) {
            htmlString += '<div class="listed-node-container"><span class="listed-node-name">id:</span><span class="listed-node-id">' + data[i].id + '</span></div>'
        }
        $( "#full-node-list" ).html( htmlString );
    });
}

function addAttribute(){

    var id = $('#add-attr-id')[0].value;
    var key = $('#add-attr-key')[0].value;
    var val   = $('#add-attr-val')[0].value;

    if(id === '') {
        id = undefined;
    }
    Weaver.Node.load(id).then(function(node) {
        node.set(key,val);
        node.save();
    })
}

function addRelation(){
    var id1 = $('#add-rel-id1')[0].value;
    var key = $('#add-rel-key')[0].value;
    var id2 = $('#add-rel-id2')[0].value;

    if(id1 === '') {
        id1 = undefined;
    }
    if(id2 === '') {
        id2 = undefined;
    }

    Weaver.Node.load(id1).then(function(node1) {
        Weaver.Node.load(id2).then(function(node2){
            node1.relation(key).add(node2)
            node1.save()
        })
    })
}

function runQuery() {
    query = $('#query-div').val()

    q = new Weaver.Query();
    q.nativeQuery(query)
    .then(function(res) {
            $('#query-div').val(JSON.stringify(res, null, 4));
    })
}
function wipe(){
    currentProjId = Weaver.currentProject.id();
    currentProject = new Weaver.Project(currentProjId);
    currentProject.wipe();
}

// UTIL FUNCTION TO HANDLE 'TAB' KEYPRESS IN TEXTAREA

$(document).delegate('#query-div', 'keydown', function(e) {
    var keyCode = e.keyCode || e.which;

    if (keyCode == 9) {
        e.preventDefault();
        var start = $(this).get(0).selectionStart;
        var end = $(this).get(0).selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        $(this).val($(this).val().substring(0, start)
            + "\t"
            + $(this).val().substring(end));

        // put caret at right position again
        $(this).get(0).selectionStart =
            $(this).get(0).selectionEnd = start + 1;
    }
});
