	

    // Constants
	const PROJECT = 'map' ; 
    const host     = "http://www.gicr.local/cms/" ; // gicrdev.iarc.lan
    const host_api = host +"wp-json/wp/v2/" ; 
    const hubs_per_name = [] ;
    const hubs_per_code = [] ;  

    const hubs = [] ; 

    /*
        { 'id' : 1 , 'code' : 'AFCRN' , 'name' : 'SS-Africa' , 'label' : 'Sub-Saharian Africa', 'color' : '#71C8E3' , 'plot_name' : 'ZAF' , 'plot_translate' : { 'x' : 150 , 'y' : -250 } } , 
        { 'id' : 2 , 'code' : 'IZMIR' , 'name' : 'NA,C-Africa, W.Asia' , 'label' : 'Northern Africa, Central and Western Asian', 'color' : '#724A98' , 'plot_name' : 'MAR' , 'plot_translate' : { 'x' : 250 , 'y' : -180 } } , 
        { 'id' : 3 , 'code' : 'MUMB' , 'name' : 'S,E,SE Asia' , 'label' : 'South, Eastern and South-Eastern Asia',  'color' : '#2EAF81' , 'plot_name' : 'CHN' , 'plot_translate' : { 'x' :  250 , 'y' : -350 }} , 
        { 'id' : 4 , 'code' : 'PI' , 'name' : 'Pacific' , 'label' : 'Pacific Islands',  'color' : '#ff6600' , 'plot_name' : 'FJI' , 'plot_translate' : { 'x' : 90 , 'y' : -160 } } , 
        { 'id' : 5 , 'code' : 'CARIB' , 'name' : 'Carribean' , 'label' : 'Carribean',  'color' : '#b21c01' , 'plot_name' : 'SUR' , 'plot_translate' : { 'x' : 100 , 'y' : -150 } } ,
        { 'id' : 6 , 'code' : 'LA' , 'name' : 'LatAm' , 'label' : 'Latin America',  'color' : '#cca300', 'plot_name' : 'PER' , 'plot_translate' : { 'x' : 100 , 'y' : -280 }}
    ] ; */

    hubs.sort( function(a, b){ return a.key > b.key; } );

    for ( var h in hubs ) 
    {
        hubs_per_name[ hubs[h].name ] = hubs[h] ; 
        hubs_per_code[ hubs[h].code ] = hubs[h] ; 

        $('.line').append('<div class="line-hub" style="background-color:'+hubs[h].color+';"></div>');

        var css = 'border-top:solid 3px '+hubs[h].color 
        css += '' ; 

        $('.bottom_list').append('<div class="col-md-2"><a href="#" style="'+css+'">'+hubs[h].label+'</a></div>') ; 
    }

    var GICR = {
        'default_color'     : '#e3e3e3' , 
        'visits_color'      : '#000066' , 
        'trainings_color'   : '#006837 '
    }

    const brewer_color = 'RdPu'; 
    const brewer_nb    = 4 ; 
    const map_width   = $(window).width(); 
    const map_height  = $(window).height() - 120 ;

    // Reasignable variables 
    let zoomed      = false ; 
    let current_hub = undefined ; 
    let current_country = undefined ; 
    let view        = 1 ; 
    let event       = 1 ; 
    let level       = 0 ; 
    let countries   = [] ;
    let metric      = 'visit' ; 
    let site_visits = [] ; 
    let trainings   = [] ; 
    let site_visits_per_country = [] ; 
    let trainings_per_country = [] ; 
    let trainings_per_place ; 
    let agreements ; 
    let hubs_totals_training = [] ; 
    let hubs_totals_values = [] ; 
    let rectangle_area ; 
    let rectangles_activities ; 
    let color_training ; 
    let scale = 0 ; 
    let translate = {} ; 

    if ( $(window).width() > 1480 )
    {
        scale = 320 ; 
        translate = { 'x' : 0 , 'y' : 200 } ;     
    }
    else if ( $(window).width() > 1280 )
    {
        if ( document.location.pathname == '/index2.html' || document.location.pathname == '/index3.html' )
        {
            scale = 250 ;
            translate = { 'x' : 0 , 'y' : 40 } ;
        }
        else
        {
            scale = 250 ;
            translate = { 'x' : 0 , 'y' : 90 } ; 
        }
    }
    else
    {
        scale = 250 ; 
        translate = { 'x' : 0 , 'y' : 150 } ; 
    }

    // configuration as constant
	const dataviz_conf = {
        'type'      : 'map' , 
        'title'     : false , 
        'width'     : $(window).width()  , 
        'height'    : $(window).height() - 160  , 
        'container' : '#map-container',
        'id'        : 'map-graph' , 
        'data'      : {
            'format' : 'json',
            'src'    : [{ 'label' : 'Test' , 'value' : 10 },{ 'label' : 'Test' , 'value' : 10 }]
        },
        'chart' : {
            'scale' : 250 , 
            'key_data_value' : 'value' , 
            'scale' : scale , 
            'key_data_value' : 'value' , 
            'globe_translate' : translate , 
            'projection' : 'natural-earth' , 
            'legend_suffix' : '' , 
            'color_scale' : 'quantile' ,
            'background_globe' : '#fff', 
            'key_label_value' : 'ASR',
            'callback_click' : 'funcClickMap' , 
            'callback_mousehover' : 'funcHoverMap' , 
            'callback_mouseout' : 'funcOutMap' , 
            'copyright' : false , 
            'legend' : false
        }, 
        'downloads' : false 
     } ;

    $(document).ready(function(){

        loadGircData();

        const oMap = new CanChart( dataviz_conf ).render() ;

        $(".tabs-menu a").click(function(event) {
            event.preventDefault();
            $(this).parent().addClass("current");
            $(this).parent().siblings().removeClass("current");
            var tab = $(this).attr("href");
            $(".tab-content").not(tab).css("display", "none");
            $(tab).fadeIn();
        });

        // buildTimeline() ; 

        $('#show_annotations').click( function(){
            $('g.annotation-group').toggle();
        }) ;

        setTimeout(function(){
            $('.intro').fadeOut({ 'duration' : 1000 }) ; 
        }, 5000 ) ; 

    }) ;


    var goToTheMap = function(){
        $('.intro').fadeOut(); 
    }

    var setFunctionView = function( item )
    {   
        // $('#title-map').text( title + ': '+ $('select[name="function"] :selected').text() ) ; 

        if ( item == undefined )
            metric = 'visit' ; 
        else
            metric = $('select[name="function"] :selected').val() ; 

        d3.selectAll('.visits').transition()
            .duration( 750 )
            .attr('r', function(d){
                if ( d.properties.site_visits != undefined ) return CanGraphRadiusBubble(d.properties.site_visits); 
            } )
            .delay( 750 )
        ; 

        /*d3.selectAll('.training-circle')
            .data( CanGraphTrainings.features )
            .transition()
            .duration( 750 )
            .attr('r',function(d){
                return CanGraphRadiusBubble( d.properties.total ) ; 
            })
            .attr('fill', GICR.trainings_color )
            .delay( 750 )
        ; */



    }

    /**
    *
    *
    */
    var setViewPer = function( view_p , item ){

        view = view_p ; 

        $( 'a.view.button' ).removeClass( 'active' );
        $( item ).addClass('active'); 

        d3.selectAll('.activities').remove() ;

        switch ( view )
        {
            case 1 : 
                $('.filter-years').hide(); 
                $('.filter-geography').show(); 
                $(".unit-label").fadeIn() ;
                $('select [name="geography"]').val( 'global' );
                $('.for_bubble').hide();
                $('ul.hubs-list').show();
                $('ul.activities-list,.training-circles-group').hide();
                $('table#global_indicators').hide(); 
                $('svg#legend_bubble').html(' ');

                $('#timeline').removeClass('open');

                setFunctionView( undefined );


                break ; 
            
            case 2 : 
                $('.filter-years').show(); 
                $('.filter-geography').hide(); 
                $(".unit-label").fadeOut() ;
                $('#hubPanel,#countryPanel').removeClass('show') ;
                $('ul.hubs-list').hide();
                $('ul.activities-list,.training-circles-group').show();
                $('table#global_indicators').show(); 
                $('.for_bubble').show();

                buildCircleLegend();

                if ( level != 0 ) zoomRegion( undefined ) ; 

                // $('#timeline').removeClass('open');

                setTimeout(function(){
                    
                    rectangles_activities = CanMapSvg.append("g")
                        .attr('class','activities')
                        .attr("transform", "translate("+CanMapConf.chart.globe_translate.x+","+CanMapConf.chart.globe_translate.y+")")
                    ;

                    CanGraphRadiusBubble = d3.scaleSqrt()
                        .domain([ 0, 10 ])
                        .range([ 0, 15 ]);

                    rectangle_area = d3.scaleSqrt()
                        .domain([ 0, 10 ])
                        .range([ 0, 50 ]);

                    // build sit visits
                    rectangles_activities.append("g")
                        .attr("class","groupe_circles")
                        .selectAll("circle")
                        .data( CanGraphGeometries.features )
                        .enter()
                        .append('circle')
                        .attr("class","visits")
                        .style('fill', function(d){  return GICR.visits_color ; })
                        .style('fill-opacity', 1 )
                        .style('stroke','#ffffff')
                        .style('stroke-width','.5px')
                        .attr("transform", function(d) { 
                            var centroid = CanGraphMapPath.centroid(d) ; 
                            return "translate(" + ( centroid[0] ) + "," + centroid[1]+ ")"; 
                        })
                        .on('mouseover', function(d){ hoverFunction(d,$(this).attr('class')) })
                        .on("mouseout", function(d){ outFunction(d) })
                    ;

                    var agreements_points = rectangles_activities.append("g")
                        .attr("class","groupe_agreement")
                        .selectAll("img")
                        .data( CanGraphGeometries.features )
                        .enter()
                        .append("svg:image")
                        .attr("class","agree")
                        .attr("xlink:href","img/agreement.png")
                        .attr("width",function(d){ if( d.properties.agreement == true ) return 20 ; return 0 ;})
                        .attr("height",function(d){ if( d.properties.agreement == true ) return 20 ; return 0 ; })
                        .attr("x", function(d) { 
                            if( d.properties.agreement == true )
                            {
                                var centroid = CanGraphMapPath.centroid(d) ; 
                                return centroid[0] ; 
                            }
                        })
                        .attr("y", function(d) { 
                            if( d.properties.agreement == true )
                            {
                                var centroid = CanGraphMapPath.centroid(d) ; 
                                return centroid[1]; 
                            }
                        })
                        .on('mouseover', function(d){ hoverAgreeFunction(d,$(this).attr('class')) })
                        .on("mouseout", function(d){ outFunction(d) })

                    setFunctionView( undefined );

                }, 500 );
                break ; 

            /* case 3 : 
                $('.filter-function').hide(); 
                $('.filter-geography').hide(); 
                $(".unit-label").fadeIn() ;
                
                $('select [name="geography"]').val( 'global' );
                $('.for_bubble').hide();
                $('svg#legend_bubble').html(' ');

                //
                $('#timeline').addClass('open');

                break ; */
        }

        updateGeographyFilling(); 

        // reset global view
        zoomView('','global') ;
    }

    var countryTooltip = function( item ){

    }


    var hoverFunction = function( item , class_name ){

        $('.canTooltip').show(); 

        var mouse = d3.mouse( CanMapSvg.node()).map(function(d) {
            return parseInt(d);
        });

        CanMapTooltip
            .style('top', (mouse[1] - 60 ) + 'px')
            .style('left', (mouse[0] - 80 ) + 'px');

        // $('.canTooltip div.tooltip-line').css('background-color', ( class_name == 'visits') ? GICR.visits_color : item.properties.values.color ) ; 
        $('.canTooltip div.tooltip-line').css('background-color', item.properties.values.color ) ; 
        $('.canTooltip h2').html( item.properties.CNTRY_TERR + '<span>'+ ( ( class_name == 'visits') ? item.properties.site_visits : item.properties.trainings ) +' '+class_name+'(s)</span>' ) ; 
        $('.canTooltip p').html(' ') ; 
    }

    var hoverAgreeFunction  = function( item , class_name ){

        $('.canTooltip').show(); 

        var mouse = d3.mouse( CanMapSvg.node()).map(function(d) {
            return parseInt(d);
        });

        CanMapTooltip
            .style('top', (mouse[1] - 60 ) + 'px')
            .style('left', (mouse[0] - 80 ) + 'px');


        $('.canTooltip div.tooltip-line').css('background-color', '#fcbd00' )
        $('.canTooltip h2').html( item.properties.CNTRY_TERR + ' <br><span> Collaborative Research Agreement in 201X </span>' ) ; 
        $('.canTooltip p').html(' ') ; 
    }

    var outFunction = function(){
        $('.canTooltip').hide();
    }

    /**
    *
    */
    var buildGeoLegend = function(){

        // build legend 
        hubs.sort( function(a, b){ return a.label > b.label ; } );
        // console.info(hubs);

        for ( var h in hubs )
        {
            var span_a = '<span class="hub" style="background-color:'+hubs[h].color+';"></span>'+hubs[h].name ; 
            var li = '<li attr-iso="'+hubs[h].name+'" ><a href="javascript:void(0)" onclick="zoomView(\''+hubs[h].id+'\',\'hub\')">'+span_a+'</a></li>' ; 
            $('ul.hubs-list').append( li ); 
        }

        $('ul.hubs-list').append( '<li attr-iso="0"><a href="javascript:void(0)"><span class="hub" style="background-color:'+GICR.default_color+';"></span>Not applicable</a></li>' ) ;

        // hover function
        $('ul.hubs-list li').hover( function(){
            var attr_hub = $(this).attr('attr-iso'); 
            if ( attr_hub == '0' || attr_hub == 0) return ; 
            $('path.country[attr-hub="'+attr_hub+'"]').addClass('hover') ; 
        }, function(){
            $('path.country').removeClass('hover') ; 
        }) ; 

        // build activities legend
        var ul_act = 'ul.activities-list' ; 

        var r_c = 6.5 ; 
        var c_w = 30 ;
        var c_h = 20 ; 

        var legend_colors = Array.prototype.slice.call( colorbrewer[ brewer_color ][ brewer_nb ] ) ; 
        legend_colors.reverse();    

        // Remove the gradient legend (number of courses) for now
        /* $(ul_act).append( '<li>Number of course(s) per hub:</li>');

        for ( var l in legend_colors )
        {
            var extent = color_training.invertExtent(legend_colors[l]) ; 
            
            var suffix = '' ;
            if ( l == 0 )
                suffix = '≥ '+ format(extent[0])  ; 
            else if (l == (legend_colors.length - 1))
                suffix =  '< ' + format(extent[1]) ; 
            else
                suffix =  format(extent[0]) +'-'+ format(extent[1]) ;

            $(ul_act).append( '<li ><a href="javascript:void(0)"><span class="hub" style="background-color:'+legend_colors[l]+';"></span>'+suffix+'</a></li>' ) ;
        }
        */ 

        $(ul_act).append( '<li style="margin-top:20px;"><a href="javascript:void(0)"><svg width="'+c_w+'" height="'+c_h+'"><circle transform="translate(15,10)" r="'+r_c+'" fill-opacity="0.7" fill="'+GICR.visits_color+'"></svg>Site visit(s)</a></li>' ) ;
        // $(ul_act).append( '<li ><a href="javascript:void(0)"><svg width="'+c_w+'" height="'+c_h+'"><circle transform="translate(15,10)" r="'+r_c+'" fill-opacity="0.7" fill="'+GICR.trainings_color+'"></svg>Training(s)</a></li>' ) ;
        $(ul_act).append( '<li ><a href="javascript:void(0)"><span class="hub"><img src="img/agreement.png" width="20" height="20"></span> Agreement with IARC</a></li>' ) ;
        
    }

    var format = function( d ){
        return Math.round( d );
    }

    /**
    *
    */
    var loadGircData = function(){

        // loading gicr map
        // d3.csv( "data/gicr.csv" , function( data ){

        var per_page = '?per_page=50&post_status=any' ; 

        var json = queue()
            .defer( d3.json  , host_api + "hubs" + per_page )
            
            // .defer( d3.json  , "/data/countries.json" )
            .defer( d3.json  , host_api + "courses" + per_page +"&page=1"  )
            .defer( d3.json  , host_api + "courses" + per_page +"&page=2" )

            .defer( d3.json  , host_api + "visits?per_page=50&page=1" )
            .defer( d3.json  , host_api + "visits?per_page=50&page=2" )
            .defer( d3.json  , host_api + "visits?per_page=50&page=3" )
            /*.defer( d3.csv , "data/site-visits.csv" )
            .defer( d3.csv , "data/trainings.csv" )
            */

            .defer( d3.json  , host_api + "countries" + per_page + "&page=1" )
            .defer( d3.json  , host_api + "countries" + per_page + "&page=2" )
            .defer( d3.json  , host_api + "countries" + per_page + "&page=3" )
            .defer( d3.json  , host_api + "countries" + per_page + "&page=4" )

            .defer( d3.csv , "data/agreements.csv" )
            
            .awaitAll( function( error , results ){

                var hubs_tmp        = results[0] ; 
                // var countries_tmp   = results[1] ; 
                
                $('#list-hubs').append( '<a class="button view active" attr-hub="0" onclick="zoomView(\'\',\'global\')"> Global </a>' ) ; 

                for ( var s in hubs_tmp )
                {
                    var label       = hubs_tmp[ s ].name ; 
                    hubs.push( hubs_tmp[s] ) ; 
                    hubs_per_name[ hubs[s].name ] = hubs[s] ; 
                    hubs_per_code[ hubs[s].code ] = hubs[s] ; 
                    $('#list-hubs').append( '<a class="button view" attr-hub="'+hubs_tmp[ s ].id+'" onclick="zoomView('+hubs_tmp[ s ].id+',\'hub\')"> '+label+' </a>' ) ; 
                    
                } // end for 

                hubs.sort( function(a, b){ return a.key > b.key; } );

                // concat trainings
                trainings   = results[1].concat( results[2] ) ; 

                // concat visits
                var visits_tmp = results[3].concat( results[4] , results[5] ) ; 
                for ( var c in visits_tmp )
                {
                    if ( visits_tmp[c].hub != false && visits_tmp[c].iso != "" )
                    {
                        site_visits.push( visits_tmp[c] ); 
                    }
                }

                // merge countries 
                var countries_tmp = results[6].concat( results[7] , results[8] , results[9] ) ; 

                for ( var c in countries_tmp )
                {
                    if ( countries_tmp[c].hub != false && countries_tmp[c].iso != "" )
                    {
                        countries.push( countries_tmp[c] ); 
                    }
                }

                buildGlobalIndicators({ 'site_visits' : site_visits , 'trainings' : trainings , 'agreements' : [] }) ; 

                grabGicrValues(); 

                buildAnnotations() ; 
            })
        ;

    } // end function 


    var getCountryHub = function( country )
    {
        var hub = {} ; 
        if ( country[0] == undefined ) return ; 

        var hub_rel = country[0].hub ;
        for ( var h in hub_rel ) {
            hub = hub_rel[h] ; 
            break ; 
        }

        return hub ; 
    }

    var buildGlobalIndicators = function( data )
    {
        // console.info( data ) ; 

        agreements = data.agreements ; 

        var site_visits_per_hubs = d3.nest()
            .key( function(d){ 

                var country = getCountryById( d.country ) ; 
                //console.info( d.country , country ) ; 
                var hub = getHubById( country.hub ) ;
                
                return hub.code ; 
            })
            .rollup(function( hub ) { 
                return {  
                    "total": hub.length , 
                    "data" : d3.nest()
                        .key( function(i){ return i.status ; })
                        .entries( hub )
                } 
            })
            .entries( data.site_visits ) ;

        // for ( var v in site_visits_per_hubs ) site_visits_per_hubs[v].label = hubs_per_code[ site_visits_per_hubs[v].key ].name ; 
        site_visits_per_hubs.sort( function(a, b){ return hubs_per_code[a.key].name > hubs_per_code[b.key].name ; } );

        var trainings_per_hubs = d3.nest()
            .key( function(d){ 

                var country = getCountryById( d.country ) ; 

                if ( country == undefined ) 
                {
                    // console.error( "Country not found for id=" + d.country +": please ensure the country exists with this ID in Wordpress") ; 
                    return ; 
                }

                // console.info( d.country , country );
                // console.info( d.title.rendered , '['+country.name+']' , d.country, country.hub , hub.name  ) ; 
                var hub = getHubById( country.hub ) ;

                return hub.code ; 
            })
            .rollup( function( hub ) { 
                return {  
                    "total": hub.length , 
                    "data" : d3.nest()
                        .key( function(i){ return i.status ; })
                        .entries( hub )
                } 
            })
            .entries( data.trainings ) ;

        var tot_vists = 0 ; 
        var tot_trainings = 0 ; 

        // console.info( site_visits_per_hubs ) ; 

        for ( var h in site_visits_per_hubs )
        {
            var completed_visits = 0 ; 

            if( site_visits_per_hubs[h].key == 'undefined' || site_visits_per_hubs[h].value == undefined ) 
            {
                // console.info( h , site_visits_per_hubs[h] ) ; 
                continue ;  
            }

            for ( var d in site_visits_per_hubs[h].value.data[0].values )
            {
                if ( site_visits_per_hubs[h].value.data[0].values[d].visit_status[0] == 'completed' )
                {
                    completed_visits++ ; 
                }
                 
            }
            var completed_trainings = 0 ; 
            for ( var d in trainings_per_hubs[h].value.data[0].values )
            {
                if ( trainings_per_hubs[h].value.data[0].values[d].course_status[0] == 'completed' )
                {
                    completed_trainings++ ; 
                }
                 
            }

            var html = '<tr>' ; 

            html += '<td>'+ hubs_per_code[ site_visits_per_hubs[h].key ].name+'</td>' ; 
            html += '<td class="value">'+completed_visits+'</td>' ; 
            html += '<td class="value">'+completed_trainings+'</td>' ; 
            html += '</tr>'; 

            hubs_totals_training.push({ 
                'key'   : site_visits_per_hubs[h].key , 
                'total' : completed_trainings 
            }) ; 

            tot_vists += Math.abs( completed_visits ) ; 
            tot_trainings += Math.abs( completed_trainings ) ; 


            $('table#global_indicators').append( html )
        }
         
        var total_html = '<tr>' ; 
        total_html += '<td class="value"><strong><u>Total</u></strong></td>' ; 
        total_html += '<td class="value">'+(tot_vists)+'</td>' ; 
        total_html += ' <td class="value">'+(tot_trainings)+'</td>' ; 
        total_html += '</tr>'; 


        $('table#global_indicators').append( total_html ) ; 

        // grab data to hub map 
        // console.info( data.site_visits ) ; 

        // building data per countries
        site_visits_per_country = d3.nest()
            .key( function( d ){ 
                var country = getCountryById( d.country ) ; 
                if ( country == undefined ) return ; 
                return country.iso ;  
            })
            .rollup(function( country ) { return {  "total": 1} })
            .entries( data.site_visits  ) ; 

        trainings_per_country = d3.nest()
            .key( function( d ){ 
                var country = getCountryById( d.country ) ; 
                if ( country == undefined ) return ; 
                return country.iso ;   
            })
            .rollup(function( country ) { return {  "total": country.length } })
            .entries( data.trainings  ) ; 

        /*trainings_per_place = d3.nest()
            .key( function( d ){ return d.place ;  })
            .rollup(function( place ) { return {  
                "total": place.length , 
                "gps_x" : place[0].gps_x , 
                "gps_y" : place[0].gps_y , 
                "status" : place[0].status , 
                "data" : place
            } })
            .entries( data.trainings  ) ; */

    }

    var buildAnnotations = function(){

        // create a container for tooltips

        const type = d3.annotationLabel 

        const annotationGroup = CanMapSvg
          .append("g")
          .attr("class", "annotation-group") ; 

        let annotations = [] ; 

        const hubs_annotations = {
            2 : { // African ()
                dy : 100 , 
                dx: -50
            } , 
            3 : { // Izmir
                dy : -100 , 
                dx: -200
            } , 
            4 : { // India (Mumbai)
                dy : 150 , 
                dx : -10
            } , 
            5 : { // pacific
                radius : 60
            } , 
            6 : { // carribean
                radius : 50 ,
                dy : -150 , 
                dx : -250
            } , 
            7 : { // latin america
                dy : -50 , 
                dx : -150
            }

        } ; 

        hubs.forEach(function(d){

            var hub_settings = hubCentroidPerId( d.id ) ; 

            // get country item per hub
            var item = checkCountry( CanGraphGeometries.features , hub_settings.codeCountry ) ; 

            // get centroid of item
            var centroid = CanGraphMapPath.centroid( item ) ; 

            let h = hubs_annotations[d.id] ;

            annotations.push({
              note      : { label : d.regional_hub_center , title:  d.code } ,
              subject   : { radius : ( h.radius == undefined ) ? 2 : h.radius } ,
              connector : { end: "arrow" } ,
              x         : centroid[0] , 
              y         : centroid[1] + 100 ,
              color     : '#ff8684',
              stroke    : 'black',
              className : 'annotation_' + d.code , 
              dy        : ( h.dy == undefined ) ? 100 : h.dy , 
              dx        : ( h.dx == undefined ) ? -150 : h.dx
            }); 

        });

        let makeAnnotations = d3.annotation()
            .editMode(true)
            .type( d3.annotationCalloutCircle )
            .annotations( annotations )

        annotationGroup.call( makeAnnotations ) ; 
    }

    /**
    *
    */
    var grabGicrValues = function(){

        // for ( var ss in countries ) console.info( countries[ss] ) ; 
        
        // console.info( hubs_totals_training , CanGraphGeometries.features ) ; 

        for( var f in CanGraphGeometries.features ) 
        {
            // for all countries, if iso is defined in DB + iso 3 code
            var c = CanGraphGeometries.features[f].properties  ;

            for ( var g in countries )
            {
                // fin color of country (via hub)
                if ( c.ISO_3_CODE == countries[g].iso )
                {
                    c.values        = countries[g] ; 
                    var hub_l       = getHubById( countries[g].hub ) ; 
                    c.values.color  = hub_l.color ;
                    // console.info( c.SOVEREIGN , hub_l.color ) ; 
                    break ; 
                }
            }

            // site visits
            for ( var g in site_visits_per_country )
            {

                if ( c.ISO_3_CODE == site_visits_per_country[g].key && site_visits_per_country[g].values != undefined )
                {
                    c.site_visits = site_visits_per_country[g].values.total ; 
                    break ; 
                }
            }

            // training per country 
            for ( var g in trainings_per_country )
            {
                if ( c.CNTRY_TERR == trainings_per_country[g].key )
                {
                    c.trainings = trainings_per_country[g].values.total ; 
                    break ; 
                }
                
            }

            // training per hub
            for ( var gt in hubs_totals_training )
            {   

                /*var hub = getHubById( c.values.hub ) ; 
                if ( c.values != undefined && hub.code == hubs_totals_training[gt].key )
                {
                    c.hub_total_trainings = hubs_totals_training[gt].total ; 
                    hubs_totals_values.push( hubs_totals_training[gt].total ) ; 
                    break ;
                }*/
                
            }

            // agreements
            for ( var a in agreements )
            {
                if ( c.values != undefined && c.values.iso == agreements[a].iso )
                {
                    c.agreement = true ; 
                    break ;
                }

                c.agreement = false ; 
            }

           
        } // end for 

        // grab trainings to bubbles
        for ( var g in CanGraphTrainings.features )
        {
            var path = CanGraphTrainings.features[g] ; 
            
            for ( var p in trainings_per_place )
            {
                var place = trainings_per_place[p] ; 

                if ( place.key == path.properties.Name && place.values.status == "Completed")
                {
                    path.properties.total = place.values.total ; 
                    path.properties.data = place.values.data ; 
                    break ; 
                }
            }
        }

        updateGeographyFilling() ; 

        // populateHubsNames(); 

        populateCountryNames();

        buildLegend();

        buildGeoLegend();

    }

    var populateCountryNames = function(){

        CanMapText.selectAll(".subunit-label")
            .data( CanGraphGeometries.features )
            .enter()
            .append("text")
                .attr("id",function(d){ return "label-"+d.properties.ISO_3_CODE ; })
                .attr("class", "subunit-label" )
                .attr("transform", function(d) { 
                    var centroid = CanGraphMapPath.centroid(d) ;
                    // console.info(centroid[0],centroid[1],Math.abs(centroid[0])); 
                    if ( centroid[0] != NaN && centroid[1] != NaN )
                        return "translate(" + centroid[0] + ","+centroid[1]+")"; 
                })
                .attr("dy", ".35em")
                .text(function(d){
                    if ( d.properties.CNTRY_TERR == null ) return ; 

                    if ( d.properties.values == undefined ) 
                        return ; 
                    else
                        return d.properties.CNTRY_TERR ;
                })       
        ;

        return true ; 

    }

    var populateHubsNames = function(){

        var hubs_a = $.map( hubs , function(value, index) {
            return [value];
        }); 

        // console.info( hubs_a ); 

        CanMapSvg.selectAll(".unit-label")
            .data( hubs_a )
            .enter()
                .append("text")
                    .text(function(d){ return d.label ; })    
                    .attr("class", "unit-label" )
                    .attr("dy", ".35em")
                    .attr("width",150)
                    .attr("height",25)
                     .attr("transform", function(d) { 
                        var item = checkCountry( CanGraphMapFeatures , d.plot_name ) ; 
                        var centroid = CanGraphMapPath.centroid(item) ; 
                        // console.info( centroid , "translate(" + centroid +")" , "translate(" + centroid[0] +","+centroid[1]+")") ; 
                        var xCentroid = centroid[0] - d.plot_translate.x ; 
                        var yCentroid = centroid[1] - d.plot_translate.y ;
                        return  "translate(" + xCentroid +","+ yCentroid +")" ; 
                    })   
                    .attr("text-anchor","middle")
                    .attr("fill",function(d){  
                        return d.color ; 
                    })
        ;

        return true ; 
    }

    var updateGeographyFilling = function(){

        // 
        color_training = d3.scaleQuantile().domain( [ d3.min( hubs_totals_values ) , d3.max(  hubs_totals_values ) ] ).range( colorbrewer[ brewer_color ][ brewer_nb ] ) ; 

        d3.selectAll(".country")
            .data( CanGraphGeometries.features ) 
            .transition()
            .duration(1500)
            .attr("fill", function(d){

                // console.info( d.properties ); 
                switch( d.properties.NAME ) 
                {   
                    // lakes
                    case "Lakes" : 
                        return "#fff" ;
                        break ; 

                    // all countries
                    case "" : 
                    case undefined :
                    case null :
                        if ( d.properties.values == undefined )
                        {
                            return GICR.default_color ; 
                        }
                        /* else if ( view == 2 )
                        {
                            // console.info( d.properties.values.Country , d.properties.values.HUB , d.properties.hub_total_trainings ) ; 
                            return color_training( d.properties.hub_total_trainings ) ; 
                        } */
                        else
                        {
                            if ( document.location.pathname == '/index3.html' ) return '#0b80b7' ; 

                            switch ( level )
                            {
                                case 0 : 
                                    if ( d.properties.ISO_2_CODE == "RU") 
                                        return GICR.default_color ; 
                                    else
                                        return d.properties.values.color ; 
                                    break ; 

                                case 1 : 

                                    var hub = getHubById( current_hub ) ; 
                                    
                                    var country_hub = getHubById( d.properties.values.hub ) ; 

                                    if ( hub != undefined && hub.code == country_hub.code ) 
                                        return d.properties.values.color ; 
                                    else
                                        return GICR.default_color ;                                    
                                    break ; 

                                case 2 : 
                                    if ( d.properties.ISO_3_CODE == current_country )
                                        return d.properties.values.color ; 
                                    else
                                        return GICR.default_color ;  

                                    break ; 

                            } // end swtich 
                        }
                        break ; 

                    // borders
                    default : 
                        return GICR.default_color ; 

                } // end switch
            }) 
            .attr('attr-hub', function(d) { 
                if ( d.properties.values !=  undefined ) return d.properties.values.HUB ;
                return '' ;  
            })
        ; 
    }

    var getHubById = function( hub_id )
    {
        var hub ; 

        for ( var h in hubs )
        {
            if ( hubs[h].id == hub_id )
            {
                hub = hubs[ h ] ; 
                break ; 
            }
        }

        return hub ; 
    }

    var getCountryByIso = function( iso )
    {
        var country ; 

        for ( var i in countries )
        {
            if ( countries[i].iso == iso )
            {
                country = countries[ i ] ; 
                break ; 
            }
        }

        return country ; 
    }


    // console.info( countries ) ; 

    var getCountryById  = function( id )
    {
        var country ; 

        for ( var i in countries )
        {
            if ( countries[i].id == id )
            {
                country = countries[ i ] ; 
                break ; 
            }
        }

        return country ; 
    }

    var zoomRegion = function( codeCountry , scale , translateX , translateY , hub_id )
    {
        var CanGraphMapFeatures = d3.selectAll(".country") ; 

        var focusedCountry = checkCountry( CanGraphMapFeatures , codeCountry );

        // 1st case : no focus found
        // 2nd case : click same hub so unzoom
        if ( codeCountry == undefined || focusedCountry == undefined || ( hub_id != undefined && current_hub == hub_id ) ) 
        {
            current_hub = undefined ; 

            var x = 0 ;
            var y = 0 ; 
            scale = 1 ; 
            var stroke_width = 1 ; 
            var translate = "translate("+dataviz_conf.chart.globe_translate.x+","+dataviz_conf.chart.globe_translate.y+")" ; 
            
            zoomed = false ; 

            $('text.subunit-label').removeClass('zoomed');
        }
        else
        {
            current_hub = Math.abs( hub_id ) ; 

            var centroid = CanGraphMapPath.centroid( focusedCountry ) ;
            var x = centroid[0] ;
            var y = centroid[1] ;
            var stroke_width = 1.5 / scale ; 
            var centered = focusedCountry ;
            if ( translateX == undefined ) translateX = map_width / 4 ; 
            if ( translateY == undefined ) translateY = map_height / 2 ; 
            var translate = "translate(" + translateX + "," + translateY + ")" ; 

            zoomed = true ;    
            
            $('.annotation-group').hide(); 
        }

        d3.selectAll("g#mapGroup")
            .transition()
            .duration( 1500 )
            .attr("transform", translate + "scale(" + scale + ")translate(" + -x + "," + -y + ")")
            .on("end",function(){
                /*if ( level == 0 )
                    $('.annotation-group').show();*/
            })
        ;

        // 
        if ( view == 2 && level == 1 )
        {
            d3.selectAll("g.activities")
                .transition()
                .duration( 1500 )
                .attr("transform", translate + "scale(" + scale + ")translate(" + -x + "," + -y + ")") ; 
        }
        // zoom leve into a country
        else if ( view == 1 && level == 2 ) // Geography view & 
        {
            $('.place-circles-group').show() ;
            d3.selectAll("g.place-circles-group,g.mapText,g.place-label-group")
                .transition()
                .duration( 1500 )
                .attr("transform", translate + "scale(" + scale + ")translate(" + -x + "," + -y + ")"); 

           
        }
        else
        {
            // always hide small places
            $('.place-circles-group').hide();

        }
    }

    var showGallery = function(){

        $('a[data-fancybox="gallery"][attr-key="0"]').trigger('click') ;
    }

    var showActivities = function( hub_id ){

        view = 2 ; 
        zoomView( hub_id , 'hub' ) ; 
    }

    var backRegion = function( hub_id ){
        view = 1 ; 

        $('#countryPanel').removeClass('show') ;
        $('#hubActivities').removeClass('show') ;

        zoomView( hub_id , 'hub' , false  ) ;    
    }

    /**
    *
    * @type global | hub | hub-country
    **/
    var zoomView = function( item , type , zoom )
    {
        var scale   = 2 ;
        var option  = type ; 
        var hub_id  = Math.abs( item ) ; 


        $('#list-hubs a').removeClass('active') ; 
        $('#list-hubs a[attr-hub="'+hub_id+'"]').addClass('active') ; 

    
        // console.info( option ) ; 

        switch( option ) 
        {
            case "global" :
                view = 1 ; 
                level = 0 ; 
                $('#hubPanel').removeClass('show') ;
                $('#countryPanel').removeClass('show') ;
                $('#hubActivities').removeClass('show') ;

                zoomRegion( undefined ) ; 
                setTimeout(function(){
                    $(".unit-label").fadeIn(); 
                },1500);
                
                $('text.subunit-label').removeClass('zoomed selected');
                $('text.place-label').removeClass('show');
                $('.hubs-list').removeClass('hidden');
                break ; 


            case "hub" : 
                
                level = 1 ; 
                var hub = getHubById( hub_id ) ; 
                var height_panel = $(window).height() - (  120 + 50 + 25 + 45 ) ;  

                if ( view == 1 ) // view per geography 
                {
                    $(".unit-label").hide() ; 
                    $('.hubs-list').addClass('hidden');
                    $('#hubPanel').addClass('show') ;
                    $('#countryPanel').removeClass('show') ;

                    // calculate the number of the height sscroll view panel 
                    $('div#hubPanel,div#countryPanel').css( { 'height' : height_panel } ) ;  
                    $('select.hubCountries').html('<option value=""> Countries </option>') ; 
                    $('.hub-name').css('color' , hub.color ).text( hub.name ) ; 
                    $('.hub-line,div#hubPanel a.close,.baseline ul li .block').css('background-color' , hub.color ) ; 
                    $('.item h3').css('color' , hub.color ) ; 
                    $('text.place-label').removeClass('show');
                    
                    // gicr_csv.sort( function(a, b){ return a.Country > b.Country ; } );
                    
                    // apply pictures 
                    $('#gallery_hub').html(' ') ; 
                    for ( var h in hub.photos_hubs )
                    {
                        var url = hub.photos_hubs[h].guid ; 
                        $('#gallery_hub').append('<li><a data-fancybox="gallery" href="'+url+'" attr-key="'+h+'"><img class="gallery" src="'+url+'"></li>')
                    } 

                    sortByKey( countries , 'name' , 'ASC' ) ; 
                    console.info( countries );
                    for ( var g in countries )
                    {
                        if( countries[g].hub == hub.id ) 
                        {
                            //$('ul.hubCountries').append('<li><a href="#" onclick="zoomCountry(\''+countries[g].iso+'\')" hover-color="'+hub.color+'" iso-code="'+countries[g].iso+'">'+countries[g].name+'</a></li>') ; 
                            $('select.hubCountries').append('<option hover-color="'+hub.color+'" iso-code="'+countries[g].iso+'" value="'+countries[g].iso+'">'+countries[g].name+'</option>') ; 
                        
                        }
                    }
                }
                else if ( view == 2 ) // view per activites 
                {   
                    // list on the left visits and on the right courses
                    
                    $(".unit-label").hide() ; 
                    $('#hubPanel').removeClass('show') ;

                    $('.hubs-list').addClass('hidden');
                    $('#hubActivities').addClass('show') ;

                    $('div#hubActivities').css( { 'height' : height_panel } ) ;  
                    $('div#hubActivities a.back').attr('onclick','backRegion('+hub_id+')') ;

                    $('.hub-name').css('color' , hub.color ).text( hub.name ) ; 
                    $('.hub-line,div#hubActivities a.close,div#hubActivities a.back').css('background-color' , hub.color ) ; 

                    // $('.list_visits').html(' ');
                    // $('.list_visits').append('<h3>Site visits:</h3>');

                    // console.info( site_visits ) ; 
                    var visits_per_year = d3.nest()
                        .key( function(d){ return Math.abs(d.year); })
                        .entries( site_visits ) ; 
                    visits_per_year.sort( function(a, b){ return a.key < b.key; } );
                    site_visits.sort( function(a, b){ return a.year < b.year; } );

                    // console.info( visits_per_year ) ;

                    // get list of visists + countries
                    /*for ( var s in visits_per_year )
                    {
                        let html = "" ; 

                        for ( var h in visits_per_year[s].values )
                        {
                            var c_country = getCountryById( visits_per_year[s].values[h].country )  ; 
                            var c_hub = getHubById( c_country.hub ) ; 

                            // console.info( site_visits[h] , c_hub , c_country ) ; 
                            if ( hub.code == c_hub.code && visits_per_year[s].values[h].visit_status[0] == 'completed' )
                            {
                                html += '<li><a href="/site-visit.html" rel="gallery" class="fancybox fancybox.iframe">'+c_country.name+'</a></li>' ; 
                            }
                        }   

                        if ( html != "")
                            $('.list_visits').append('<li><h4>'+ visits_per_year[s].key+'</h4> <ul class="sub-visits"> '+html+' </ul> </li>') ; 
                        
                    }*/

                    // empty timeline html
                    $('#cd-timeline').html(" ") ; 
                    var timelines = site_visits.concat( trainings ) ; 
                    sortByKey( timelines , 'year'); 
                    // console.info( timelines ) ; 

                    let years_added = [] ; 
                    let counter = 0 ; 

                    for ( var h in timelines )
                    {
                        let row = timelines[h] ; 
                        var c_country = getCountryById( row.country )  ; 
   
                        if ( c_country == undefined )
                        {
                            // console.error( row.country +' is not linked with a hub ') ; 
                            continue ; 
                        }

                        var c_hub = getHubById( c_country.hub ) ; 

                        if ( hub.code == c_hub.code ) 
                        {
                            //if ( row.type == "visit" && row.visit_status[0] == 'completed' ) continue ; 
                            //if ( row.type == "course" && row.course_status[0] == 'completed' ) continue ; 

                            let html = '' ; 
                            let is_hidden = ( counter > 7 ) ? 'is-hidden' : '' ; 
                            if ( $.inArray( row.year , years_added ) == -1 )
                            {
                                html += '<div class="cd-timeline-img '+is_hidden+'">'+row.year+'</div>' ; 
                                years_added.push( row.year ) ; 
                            }

                            let icon = ( row.type == 'course' ) ? 'fa-graduation-cap' : 'fa-plane' ; 

                            // console.info( row ) ; 

                            html += '<div class="cd-timeline-content '+is_hidden+'">' ; 
                            html += '<h2 style="color:'+c_hub.color+';"> <i class="fa '+icon+'" aria-hidden="true"></i> '+c_country.name+'</h2><p>'+row.title.rendered+'</p>' ; 
                            html += '<a href="'+row.link+'" class="cd-read-more fancybox_iframe fancybox.iframe" rel="activity">Read more</a>' ; 
                            html += '</div>'; 

                            $('#cd-timeline').append('<div class="cd-timeline-block '+row.type+'">'+html+'</div>') ; 
                            counter++ ; 
                        }                        
                    }

                    var timelineBlocks = $('.cd-timeline-block'),
                        offset = 0.8;

                    //hide timeline blocks which are outside the viewport
                    hideBlocks(timelineBlocks, offset);

                    //on scolling, show/animate timeline blocks when enter the viewport
                    $('#hubActivities .cd-container').on('scroll', function(){
                        (!window.requestAnimationFrame) 
                            ? setTimeout(function(){ showBlocks(timelineBlocks, offset); }, 100)
                            : window.requestAnimationFrame(function(){ showBlocks(timelineBlocks, offset); });
                    });

                    function hideBlocks(blocks, offset) {
                        blocks.each(function(){
                            ( $(this).offset().top > $(window).scrollTop()+$(window).height()*offset ) && $(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
                        });
                    }

                    function showBlocks(blocks, offset) {
                        blocks.each(function(){
                            ( $(this).offset().top <= $(window).scrollTop()+$(window).height()*offset && $(this).find('.cd-timeline-content').hasClass('is-hidden') ) && $(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('fade-in');
                        });
                    }
                }

                $('a.fancybox').fancybox({
                    'type'          : 'iframe',
                    'transitionIn'  : 'elastic' ,
                    'transitionOut' : 'elastic' ,
                    'speedIn'       : 600 , 
                    'speedOut'      : 200
                }) ; 

                $('a.fancybox_iframe')
                    .attr('rel', 'activity')
                    .fancybox({
                        openEffect  : 'none',
                        closeEffect : 'none',
                        nextEffect  : 'none',
                        prevEffect  : 'none'
                    });


                var hub_settings = hubCentroidPerId( hub_id ) ; 
                

                // zoom on region 
                if ( view == 1 && zoom != false )
                    zoomRegion( hub_settings.codeCountry , hub_settings.scale , hub_settings.translateX , hub_settings.translateY , hub_id ) ; 
                
                $('text.subunit-label').removeClass('zoomed selected');

                if ( view == 2 ) return ; 

                $('#btn_show_activities').attr('attr-hub', hub_id).attr('onclick','showActivities('+hub_id+')') ; 

                $('#regional_hub_center').html( '<i class="fa fa-building"></i> &nbsp; ' +hub.regional_hub_center +' overview' ) ; 
                $('#hub_centers').html( nl2br( hub.overview ) ); 
                $('#hub_pi').html( nl2br( hub.pi ) ); 
                $('#canreg_experts').html( nl2br( hub.canreg_experts ) ); 
                $('#planned_activities').html( nl2br( hub.planned_activities ) ); 

                //$('#hubPanel ul.hubCountries li').css('background-color', hub.color ) ; 
                // $('#hubPanel h3').css('border-color', hub.color ) ; 

                /*$('ul.hubCountries li a').hover(function(){
                    $(this).css('border-color', $(this).attr('hover-color') ) ; 
                    $('path#code_'+ $(this).attr('iso-code') ).addClass('hover') ; 
                },function(){
                    $(this).css('border-color', 'transparent' ) ; 
                    $('path#code_'+ $(this).attr('iso-code') ).removeClass('hover') ; 
                })*/
                break ; 

            case "hub-country" : 

                current_country = item.value ; 

                $('#hubPanel').removeClass('show') ;
                $('#countryPanel').addClass('show') ;
                $('.hubs-list').addClass('hidden');
                
                level = 2 ; 
                $(".unit-label").hide(); 
                zoomRegion( item.value , 6 ) ; 
                $('text.subunit-label').addClass('zoomed');
                $('text#label-'+ item.value ).addClass('selected');
                $('text.place-label.code-'+codeCountry).addClass('show');

                setCountryPanel( item.value ) ; 

                break ; 

        } // end switch

        updateGeographyFilling(); 
    }

    var hubCentroidPerId = function( hub_id )
    {
        switch( hub_id )
        {
        
            case 2 : // sub saharian africa
                var codeCountry = "CMR" ; 
                var translateX = map_width / 4 ; 
                var translateY = map_height / 3 ; 
                var scale = 2.2 ; 
                break ; 

            case 3 : // northern africa + south east asia
                var codeCountry = "TUR" ; 
                var scale = 1.5 ; 
                var translateX = map_width / 12 ; 
                break ; 

            case 7 : // latin america
                var codeCountry = "PER" ; 
                var scale = 1.5 ; 
                var translateX = map_width / 4 ; 
                var translateY = map_height / 2.7 ; 
                break ; 

            case 4 : // south east southern asia
                var codeCountry = "IND" ; 
                var translateX = map_width / 3.2 ;
                var scale = 1.3 ;  
                break ; 

            case 6 : // carribean
                var codeCountry = "LCA" ; 
                var scale = 3.5 ;
                var translateX = map_width / 3.5 ; 
                var translateY = map_height / 3 ; 
     
                break ; 
            case 5 : // pacific island
                var codeCountry = "FJI" ; 
                var scale = 3.5 ; 
                var translateX = map_width / 10 ; 
                break ; 
        }

        return {
            'codeCountry' : codeCountry , 
            'scale' : scale ,
            'translateX' : translateX ,
            'translateY' : translateY
        }
    }

    var zoomCountry = function( codeCountry , p_level )
    {
        current_country = codeCountry ; 

        if( p_level == undefined )
        {
            level = 2 ;  

            $(".unit-label").hide(); 

            $('#hubPanel').removeClass('show') ;
            $('text.subunit-label.selected').removeClass('selected');
            $('text.subunit-label').addClass('zoomed');
            $('text#label-'+ codeCountry ).addClass('selected');
            $('text.place-label.code-'+codeCountry).addClass('show');

            zoomRegion( codeCountry , 6 ) ; 
            setCountryPanel( codeCountry ) ; 
            updateGeographyFilling();
        }
        else
        {
            // special level 
            level = p_level ; 
            $(".unit-label").hide(); 

            var country_clicked = getCountryByIso( codeCountry ) ; // countries[ codeCountry ] ; 
            // console.info( country_clicked ) ; 
            var hub = country_clicked.hub[0] ; 

            // zoom to view
            zoomView( country_clicked.hub ,'hub') ; 

        }

    }

    var setCountryPanel = function( codeCountry )
    {
        var country = getCountryByIso( codeCountry ) ; 

        // load country profile
        var json = d3.json( host + "/wp-content/themes/twentysixteen/get_country.php?id="+ country.id , function( country ){

            $('#countryPanel').removeClass('show') ;
            $('#countryPanel').addClass('show') ;

            $('#country-name').css('color' , country.color ).text( country.name );
            $('#countryPanel a.close').css('background-color', country.color);
            $('.hub-line').css('background-color' , country.color ) ; 

            $('#tab-2').html( ( country.the_need )); 
            $('#tab-3').html( ( country.solution )); 
            $('#tab-4').html( ( country.impact )); 
            $('#tab-5').html( ( country.the_plan_of_action )); 
            $('#tab-6').html( ( country.collaborators )); 

        }) ; 
    }
        

    var buildLegend = function(){

        return ; 
        /*d3.select("svg#legend").html(' ') ; 

        var  t = textures.lines().size(6).strokeWidth(1) ; 
        CanMapSvg.call(t);

        d3.select("svg#legend")
            .append('rect')
            .attr('class','rect_Legend for_bubble')
            .attr("x", 0 ) 
            .attr("y", 20 )
            .attr("width", 35 )
            .attr("height", 15 )
            .style("stroke", GICR.default_color )
            .style("stroke-width", "0.5px")
            .style("fill",  GICR.default_color )

        // No data 
        d3.select("svg#legend")
            .append('text')
            .attr('class','text_Legend for_bubble')
            .attr("x", 50 )  // leave 5 pixel space after the <rect>
            .attr("y", 20 )  // + (CanMapHeight - 200);})
            .style('font-size','12px')
            .attr("dy", "0.9em") // place text one line *below* the x,y point
            .text("GICR countries") ;*/

    }

    var buildCircleLegend = function(){
        
        return ; 

        var svg_legend = d3.select("svg#legend_bubble")
          .append("g")
          .attr("id","bubbles-legend")  
        ; 

        var legend = svg_legend.append("g")
          .attr("class", "legend")
          .attr("transform","translate(20,20)")
          .selectAll("g")
          .data( [ 1 , 10 ] )
          .enter().append("g") ;

        legend.append("circle")
          .attr("cy", function(d) { return -CanGraphRadiusBubble(d); })
          .attr("r", function(d){ 
            return d ; 
           })
          .attr("class","circle_legend")
          .style("fill","transparent")
          .style("stroke-width","0.5px")
          .style("stroke","#000")
        ;

        legend.append("line")
          .attr("class","line_legend")
          .attr("x1", 0)
          .attr("x2", 87)
          .attr("y1", function(d) { return -(d) ; })
          .attr("y2", function(d) { return -(d) ; })
          .style("stroke","#000")
          .style("stroke-width","0.1px")
        ;

        legend.append("text")
          .attr("x", 90 )
          // .attr("y",  function(d) { return -(( $scope.radiuses(d) * 2 ) + 12 ); })
          .attr("y",  function(d) {  return -(d) - 8 ; })
          .attr("class","text_legend")
          .attr("dy", "1.3em")
          .style("font-size","8px")
          .text(function(d,i){
            return d ; 
        });

    }

    var nl2br = function  (str, is_xhtml) {   
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
    }

    function sortByKey( array, key , direction) {
        var direction ; 
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            if ( direction == undefined )
              return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            else if ( direction == 'ASC' )
              return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }