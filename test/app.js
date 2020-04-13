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
    highlighted_differences = [];
    $( ".difference" ).each(function( index ) {
        var lower = $(this).text().toLowerCase();
        if (!highlighted_differences.includes(lower)){
            $(this).addClass('difference-pill');
            highlighted_differences.push(lower);
        }
    });

    highlighted_outcomes = [];
    $( ".outcome" ).each(function( index ) {
        var lower = $(this).text().toLowerCase();
        if (!highlighted_outcomes.includes(lower)){
            $(this).addClass('outcome-pill');
            highlighted_outcomes.push(lower);
        }
    });

    highlighted_designs = [];
    $( ".design" ).each(function( index ) {
        var lower = $(this).text().toLowerCase();
        if (!highlighted_designs.includes(lower)){
            $(this).addClass('design-pill');
            highlighted_designs.push(lower);
        }
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

/*$('.dropdown-item').on('click',function () {
    alert($(this).val());
});*/

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
                var h5SnippetTitle = $('<h5/>');
                var labelSnippetTitle = $('<span>',{
                    html:hit.section
                });
                h5SnippetTitle.append(labelSnippetTitle);
                labelSnippetTitle.addClass('badge badge-secondary');
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
                liHit.append(h5SnippetTitle);
                liHit.append(pSnippetText);
            }
            if (window.displayAttributes.indexOf('abstract_excerpt') > -1){
                if(hit.abstract_excerpt !== ''){
                    var h5AbstractTitle = $('<h5/>');
                    var labelAbstractTitle = $('<span>',{
                        html:'Abstract'
                    });
                    h5AbstractTitle.append(labelAbstractTitle);
                    labelAbstractTitle.addClass('badge badge-warning');

                    var pAbstract = $('<p>',{
                        html:hit._highlightResult.abstract_excerpt.value
                    });
                    liHit.append(h5AbstractTitle);
                    liHit.append(pAbstract);
                }
            }
            if (window.displayAttributes.indexOf('best_method_snippet') > -1){
                if(hit.best_method_title !== ''){
                    var h5MethodTitle = $('<h5/>');
                    var labelMethodTitle = $('<span>',{
                        html:hit.best_method_title
                    });
                    h5MethodTitle.append(labelMethodTitle);
                    labelMethodTitle.addClass('badge badge-success');
                    var pMethodSnippet = $('<p>',{
                        html:hit._highlightResult.best_method_snippet.value
                    });
                    liHit.append(h5MethodTitle);
                    liHit.append(pMethodSnippet);
                }
            }
            if (window.displayAttributes.indexOf('best_result_snippet') > -1){
                if(hit.best_method_title !== ''){
                    var h5ResultTitle = $('<h5/>');
                    var labelResultTitle = $('<span>',{
                        html:hit.best_result_title
                    });
                    h5ResultTitle.append(labelResultTitle);
                    labelResultTitle.addClass('badge badge-primary');
                    var pResultSnippet = $('<p>',{
                        html:hit._highlightResult.best_result_snippet.value
                    });
                    liHit.append(h5ResultTitle);
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
