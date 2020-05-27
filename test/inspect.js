const client = algoliasearch('ZZ2ZTTMSBH', '71090d1229c06a4d72829a3d0d59d6bc');
const index = client.initIndex('papers_dev');
var hits_per_page = 1000;

$(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const roc = urlParams.get('roc');
    let search_roc = null;
    let searchFor = urlParams.get('searchFor');
    //alert('id = '+id+' section = '+section);
    //helper.toggleFacetRefinement('cord_uid',id).search();
    index.search('', {
        filters: 'pk_id:'+id,
        distinct: false,
        hitsPerPage:1000
    }).then(({ hits }) => {

        paper_fulltext = '';

        if (hits.length > 0){
            var myMap = new Map();

            for(let i=0;i<hits.length;i++){

                const record_num = hits[i].roc;
                myMap.set(record_num,{
                    "section":hits[i].section,
                    "text":hits[i].section_text,
                    "roc":hits[i].roc
                });
            }


            prev_section = '';
            for(let i=1;i<=hits.length;i++){
                if (myMap.has(i)){
                    curr_section = myMap.get(i).section;
                    curr_text = myMap.get(i).text;
                    curr_roc = myMap.get(i).roc;
                    addSectionName = false;
                    if (curr_section !== prev_section){
                        addSectionName = true;
                    }
                    if (addSectionName){
                        paper_fulltext += '<b>' + capitalizeFirstLetter(curr_section)+'</b><br/>';
                    }
                    if(curr_text.indexOf(searchFor)>-1){
                        search_roc = curr_roc;
                        curr_text = curr_text.replace(searchFor,'<b>'+searchFor+'</b>');
                    }
                    paper_fulltext += '<span id="'+curr_roc+'"></span>'+ curr_text+'<br/><br/>';
                    prev_section = curr_section;
                }
            }

            found_search_string = false;
            modified_search_for = searchFor;
            while(modified_search_for.length>20){
                if (paper_fulltext.indexOf(modified_search_for)>-1){
                    replacement = '<span id="result" class="highlight">'+modified_search_for+'</span>';
                    paper_fulltext = paper_fulltext.replace(modified_search_for,replacement);
                    found_search_string = true;
                    break;
                }
                modified_search_for = modified_search_for.substring(0, modified_search_for.length - 20);
            }
            if(!found_search_string){
                modified_search_for = searchFor;
                while(modified_search_for.length>20){
                    if (paper_fulltext.indexOf(modified_search_for)>-1){
                        replacement = '<span id="result" class="highlight">'+modified_search_for+'</span>';
                        paper_fulltext = paper_fulltext.replace(modified_search_for,replacement);
                        found_search_string = true;
                        break;
                    }
                    modified_search_for = modified_search_for.substring(20, modified_search_for.length-1);
                }
            }
            document.body.innerHTML = paper_fulltext;
            if(found_search_string){
                document.getElementById('result').scrollIntoView();
            }
            if(!found_search_string){
                document.getElementById(roc).scrollIntoView();
            }
        }
    });
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}