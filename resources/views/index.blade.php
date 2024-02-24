<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Silsilah BAM</title>
    <link rel="stylesheet" href="{{ asset('assets/libraries/balkan/css/familytreeTheme1.css') }}">
</head>
<body>
    <p>menu</p>
    <ul>
        <li><a href="{{ route('inputSilsilah') }}">Input Silsilah</a></li>
    </ul>
    <div style="width:100%; height:100vh;" id="tree"></div>

    <script src="{{ asset('assets/libraries/balkan/familytree.js') }}"></script>
    <script src="{{ asset('assets/libraries/balkan/familytreeTheme1.js') }}"></script>
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            var url = "{{ route('getData') }}";
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'json';

            xhr.onload = function () {
                let data = xhr.response;

                let nodes = data.map(function(v) {
                    let img = v.people_gender == "male" ? "https://as1.ftcdn.net/v2/jpg/01/87/17/86/1000_F_187178666_GyusuEACf98LSRUmYiUOvIPKv6X4MErT.jpg" : "https://as1.ftcdn.net/v2/jpg/01/59/72/90/1000_F_159729077_BM1slmOs4IuwGdDG9wCaH7l3zB42DzgE.jpg"
                    let node = {
                        id: v.id_relation,
                        // mid: v.mother_id,
                        // fid: v.father_id,
                        pids: [v.partner_id??''],
                        name: v.people_name,
                        gender: v.people_gender,
                        photo: img
                    };

                    return node
                });
                // console.log(nodes);
                let family = new FamilyTree(document.getElementById("tree"), {
                    template: "sriniz",
                    mouseScrool: FamilyTree.action.ctrlZoom,
                    enableSearch: true,
                    nodeBinding: {
                        field_0: "name",
                        // img_0: "photo"
                    },
                    editForm: {
                        photoBinding: "photo",
                        buttons: {
                            edit: null,
                            share: null,
                            pdf: null,
                            remove: {
                                icon: FamilyTree.icon.remove(24, 24, '#fff'),
                                text: 'Remove',
                                hideIfDetailsMode: true
                            }
                        }
                    },
                    // nodes: nodes
                    nodes: [
                        {
                            id: 1,
                            // mid: v.mother_id,
                            // fid: v.father_id,
                            pids: [2],
                            name: 'ddddd',
                            gender: 'male',
                            // photo: img
                        },
                        {
                            id: 2,
                            // mid: v.mother_id,
                            // fid: v.father_id,
                            pids: [1],
                            name: 'ggg',
                            gender: 'female',
                            // photo: img
                        },
                    ]
                });
                family.on('render-link', function (sender, args) {
                    if (args.cnode.ppid != undefined)
                        args.html += '<use data-ctrl-ec-id="' + args.node.id + '" xlink:href="#heart" x="' + (args.p.xa) + '" y="' + (args.p.ya) + '"/>';
                    if (args.cnode.isPartner && args.node.partnerSeparation == 30)
                        args.html += '<use data-ctrl-ec-id="' + args.node.id + '" xlink:href="#heart" x="' + (args.p.xb) + '" y="' + (args.p.yb) + '"/>';
                });
            };

            xhr.onerror = function () {
                console.log('Booo');
            };

            xhr.send();
        });

    </script>
</body>
</html>
