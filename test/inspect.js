const client = algoliasearch('ZZ2ZTTMSBH', '71090d1229c06a4d72829a3d0d59d6bc');
const index = client.initIndex('papers_dev');


$(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const section = urlParams.get('section');
    //alert('id = '+id+' section = '+section);
    //helper.toggleFacetRefinement('cord_uid',id).search();
    index.search('', {
        filters: 'cord_uid:'+id
    }).then(({ hits }) => {
        if (hits.length > 0){
            document.body.innerHTML = hits[0].key_sentences;
        }
    });
});