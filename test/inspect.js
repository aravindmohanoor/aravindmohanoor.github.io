const client = algoliasearch('ZZ2ZTTMSBH', '71090d1229c06a4d72829a3d0d59d6bc');
const index = client.initIndex('papers_dev');


$(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const section = urlParams.get('section');
    //alert('id = '+id+' section = '+section);
    //helper.toggleFacetRefinement('cord_uid',id).search();
    index.search('', {
        filters: 'pk_id:'+id,
        distinct: false
    }).then(({ hits }) => {
        let full_text = '';
        if (hits.length > 0){
            for(let i=0;i<hits.length;i++){
                full_text += hits[i].section_text+'<br/><br/><br/>';
            }
            document.body.innerHTML = full_text;
        }
    });
});