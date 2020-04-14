//Config
var applicationID = 'ZZ2ZTTMSBH';
var apiKey = '71090d1229c06a4d72829a3d0d59d6bc';
var index = 'papers_dev';
var hits_per_page = 10;

var client = algoliasearch(applicationID, apiKey);
var helper = algoliasearchHelper(client, index, {
    disjunctiveFacets: ['journal','year_month','design'],
    facetingAfterDistinct: true,
    hitsPerPage: hits_per_page
});

window.displayAttributes = ['title','section_text','abstract_excerpt','best_method_snippet','best_result_snippet'];

helper.on('result', function (content) {
    renderFacetList(content); // not implemented yet
    renderHits(content);
    updatePagination(content);
    highlightFilters();
});

function highlightFilters(){

    $( "p.snippet" ).each(function( index ) {
        highlighted_differences = [];
        $(this).find('.difference').each(function( index ) {
            var lower = $(this).text().toLowerCase();
            if (!highlighted_differences.includes(lower)){
                $(this).addClass('difference-pill');
                highlighted_differences.push(lower);
            }
        })
    });

    $( "p.snippet" ).each(function( index ) {
        highlighted_designs = [];
        $(this).find('.design').each(function( index ) {
            var lower = $(this).text().toLowerCase();
            if (!highlighted_designs.includes(lower)){
                $(this).addClass('design-pill');
                highlighted_designs.push(lower);
            }
        })
    });

    $( "p.snippet" ).each(function( index ) {
        highlighted_outcomes = [];
        $(this).find('.outcome').each(function( index ) {
            var lower = $(this).text().toLowerCase();
            if (!highlighted_outcomes.includes(lower)){
                $(this).addClass('outcome-pill');
                highlighted_outcomes.push(lower);
            }
        })
    });
}

function updatePagination(content){
    var totalResults = content.nbHits;
    var totalPages = content.nbPages;
    $('#spanNumResults').html(totalResults);
    $('#spanNumResultsPerPage').html(hits_per_page);
    $('#spanCurrentPage').html(helper.getPage()+1);
    $('#pagesDropdown').html('');
    for(var i=1;i<=totalPages;i++){
        //<button class="dropdown-item" value="1" type="button">1</button>
        var dropdownItem = $('<button>',{
            value:i,
            type:'button',
            text:i
        });
        dropdownItem.addClass('dropdown-item');
        dropdownItem.on('click',function () {
            helper.setPage(parseInt($(this).val())-1).search();
        });
        $('#pagesDropdown').append(dropdownItem);
    }
}


function renderHits(content) {
    $('#container').html(function () {
        return $.map(content.hits, function (hit) {
            var divHit = $('<div/>');
            divHit.addClass('verticalline');
            var liHit = $('<li/>');
            liHit.addClass('hitMargin');
            var pTitle = $('<p/>');
            var h4Title = $('<h4>',{
                html:hit._highlightResult.title.value
            });
            liHit.append(pTitle).append(h4Title);
            strDetails =  hit.journal+' ('+hit.year+') - '+hit.authors+' - '+' <a target="_blank" href="'+hit.url+'">'+hit.doi+'</a>';
            var pDetails = $('<p>',{
                html:strDetails
            });
            liHit.append(pDetails);
            if (window.displayAttributes.indexOf('section_text') > -1){
                var h6SnippetTitle = $('<h6/>');
                var labelSnippetTitle = $('<span>',{
                    html:'Snippet > '+hit.section
                });
                h6SnippetTitle.append(labelSnippetTitle);
                labelSnippetTitle.addClass('heading-pill');
                strSectionText = '';
                for (let [key, value] of Object.entries(hit._highlightResult.section_text)) {
                    strSectionText += value.value+' ';
                }
                // for(const text of hit._highlightResult.section_text){
                //     strSectionText += text.value + ' ';
                // }
                var pSnippetText = $('<p>',{
                    html:strSectionText
                });
                pSnippetText.addClass('snippet');
                liHit.append(h6SnippetTitle);
                liHit.append(pSnippetText);
            }
            if (window.displayAttributes.indexOf('abstract_excerpt') > -1){
                if(hit.abstract_excerpt !== ''){
                    var h6AbstractTitle = $('<h6/>');
                    var labelAbstractTitle = $('<span>',{
                        html:'Abstract'
                    });
                    h6AbstractTitle.append(labelAbstractTitle);
                    labelAbstractTitle.addClass('heading-pill');

                    var pAbstract = $('<p>',{
                        html:hit._highlightResult.abstract_excerpt.value
                    });
                    liHit.append(h6AbstractTitle);
                    liHit.append(pAbstract);
                }
            }
            if (window.displayAttributes.indexOf('best_method_snippet') > -1){
                if(hit.best_method_title !== ''){
                    var h6MethodTitle = $('<h6/>');
                    var labelMethodTitle = $('<span>',{
                        html:'Methods > '+hit.best_method_title
                    });
                    h6MethodTitle.append(labelMethodTitle);
                    labelMethodTitle.addClass('heading-pill');

                    var pMethodSnippet = $('<p>',{
                        html:hit._highlightResult.best_method_snippet.value
                    });
                    liHit.append(h6MethodTitle);
                    liHit.append(pMethodSnippet);
                }
            }
            if (window.displayAttributes.indexOf('best_result_snippet') > -1){
                if(hit.best_method_title !== ''){
                    var h6ResultTitle = $('<h6/>');
                    var labelResultTitle = $('<span>',{
                        html:'Results > '+hit.best_result_title
                    });
                    h6ResultTitle.append(labelResultTitle);
                    labelResultTitle.addClass('heading-pill');
                    var pResultSnippet = $('<p>',{
                        html:hit._highlightResult.best_result_snippet.value
                    });
                    liHit.append(h6ResultTitle);
                    liHit.append(pResultSnippet);
                }
            }

            divHit.append(liHit);
            return divHit;
        });
    });
}

$('#journal-facet').on('click', 'input[type=checkbox]', function (e) {
    var facetValue = $(this).data('facet');
    helper.toggleRefinement('journal', facetValue).search();
});

$('#year-facet').on('click', 'input[type=checkbox]', function (e) {
    var facetValue = $(this).data('facet');
    helper.toggleRefinement('year_month', facetValue).search();
});

$('#design-facet').on('click', 'input[type=checkbox]', function (e) {
    var facetValue = $(this).data('facet');
    helper.toggleRefinement('design', facetValue).search();
});

function renderFacetList(content) {
    $('#journal-facet').html(function () {
        allFacetValues = content.getFacetValues('journal');
        sortedFacetValues = allFacetValues.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        return $.map(sortedFacetValues, function (facet) {
            var checkbox = $('<input type=checkbox>').
            data('facet', facet.name).
            attr('id', 'fl-' + facet.name);
            if (facet.isRefined) checkbox.attr('checked', 'checked');
            var label = $('<label>').html(facet.name + ' (' + facet.count + ')').
            attr('for', 'fl-' + facet.name);
            return $('<li>').append(checkbox).append(label);
        });
    });
    $('#year-facet').html(function () {
        return $.map(content.getFacetValues('year_month'), function (facet) {
            var checkbox = $('<input type=checkbox>').
            data('facet', facet.name).
            attr('id', 'fl-' + facet.name);
            if (facet.isRefined) checkbox.attr('checked', 'checked');
            var label = $('<label>').html(facet.name + ' (' + facet.count + ')').
            attr('for', 'fl-' + facet.name);
            return $('<li>').append(checkbox).append(label);
        });
    });
    $('#design-facet').html(function () {
        allFacetValues = content.getFacetValues('design');
        sortedFacetValues = allFacetValues.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        return $.map(sortedFacetValues, function (facet) {
            var checkbox = $('<input type=checkbox>').
            data('facet', facet.name).
            attr('id', 'fl-' + facet.name);
            if (facet.isRefined) checkbox.attr('checked', 'checked');
            var label = $('<label>').html(facet.name + ' (' + facet.count + ')').
            attr('for', 'fl-' + facet.name);
            return $('<li>').append(checkbox).append(label);
        });
    });
}

$('#search-box').on('keyup', function () {
    helper.setQuery($(this).val()).
    search();
});

$('.section-search').on('change', function(){
    //get all checked boxes
    restrictSearchableAttributesArray = [];
    $('.section-search:checkbox:checked').each(function () {
        if(this.checked){
            restrictSearchableAttributesArray.push($(this).val());
        }
    });
    helper.setQueryParameter('restrictSearchableAttributes', restrictSearchableAttributesArray).search();
});



$('.section-display').on('change', function(){
    //get all checked boxes
    window.displayAttributes = [];
    $('.section-display:checkbox:checked').each(function () {
        if(this.checked){
            window.displayAttributes.push($(this).val());
        }
    });
    helper.search();
});

helper.search();
