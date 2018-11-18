/**
* 실시간 TOP5 기사 위젯 IIFE
*/
var realtimeSession = (function() {
    return function() {
        var gisano = 'G1111033595';

        if (!gisano) return false;

        $.getJSON('/api/realtime_session/'+ gisano)
            .done(function(json) {
                // int json.hits.total // 최근 사이트 전체 PV
                // int json.aggregations.current_news.doc_count  // 이 기사의 최근 PV
                // Array json.aggregations.top_news.buckets // 최근 톱뉴스 리스트
                // json.aggregations.top_news.buckets[0].key    // 최근 톱뉴스 gisano
                // json.aggregations.top_news.buckets[0].doc_count  // 최근 톱뉴스 PV
                // json.aggregations.top_news.buckets[0].item.hits.hits[0]._source.title
                // json.aggregations.top_news.buckets[0].item.hits.hits[0]._source.writer
                // json.aggregations.top_news.buckets[0].item.hits.hits[0]._source.log_date
                //console.log('활성 이용자수 JSON Data : ', json);
                if (json.aggregations.top_news.buckets.length == 0) return;	// 실시간 TOP 기사 목록이 누락되면 중지

                // 실시간 사용자 Component 컨테이너. 개발시에만 dynamic 하게 포함시키고 실운영시는 컨테이너는 사이드바에 포함하도록!
                if ($('.realtime-session').length == 0) {
                    var tmpHtml = '<div class="realtime-session" style="display: none">';
                    tmpHtml += '<div class="realtime-session__countdown"><span class="realtime-session__countdown-count">10</span>초</div>';
                    tmpHtml += '<div class="realtime-session__current">현재<h3><span class="realtime-session__current-count count">0</span></h3>명이 이 기사를<br>보고 있습니다</div>';
                    tmpHtml += '<div class="realtime-session__list-wrapper">';
                    tmpHtml += '<h4>실시간 TOP5 기사</h4>';
                    tmpHtml += '<ol class="realtime-session__list"></ol>';
                    tmpHtml += '</div>';
                    tmpHtml += '</div>';

                    // 본문 내 첫번째 사진 컨테이너
                    var $container = null;
                    //$container = $('.detailView img[src*="osen.co.kr"]:first').parents('div:first');
                    $container = $('.detailView img[src*="osen.co.kr"]:first').parent();
                    // 본문 내 첫번째 사진을 다른 스크립트가 table 로 감싸버린 경우
                    // if ($('.detailView img[src*="osen.co.kr"]:first').parent().get(0).tagName.toLowerCase() == 'td') {}

                    $container.append(tmpHtml);

                    realtimeSession();
                }

                // 현재 세션 수
                var currentNewsSessionCount = 1;    // 현재 접속자는 자기 자신 1
                if (json.aggregations.current_news.doc_count > 1) currentNewsSessionCount = json.aggregations.current_news.doc_count;
                // 현재 세션 수 업데이트
                $('.realtime-session__current-count').animateNumber({ number: currentNewsSessionCount });

                var html = '';

                var item, newsNo, newsPageview = 0, title = '', writer = '';

                for(var i = 0; i < json.aggregations.top_news.buckets.length; i++) {
                    row = json.aggregations.top_news.buckets[i];
                    newsNo = row.key;
                    newsUsercount = row.doc_count;
                    title = row.item.hits.hits[0]._source.title;
                    writer = row.item.hits.hits[0]._source.writer;

                    html += '<li><a href="/article/'+ newsNo +'"><span class="count">'+ newsUsercount +'명</span> '+ title +'</li>';
                }

                $('.realtime-session__list').html(html);

                if ($('.realtime-session').is(':hidden')) {
                    $('.realtime-session').show();

                    // 10초마다 업데이트
                    setInterval(function() {
                    $('.realtime-session__countdown-count')
                        .prop('number', 10)
                        .animateNumber({
                            number: 0,
                            numberStep: function (now, tween) {
                                var target = $(tween.elem),
                                rounded_now = Math.round(now);

                                if (now === tween.end) {
                                    realtimeSession();
                                } else {
                                    target.text(rounded_now);
                                }
                            }
                        }, 10000, 'linear');
                    }, 1000 * 10);
                }
            });
    }
}());
// 실시간 TOP5 기사 위젯 즉시 호출
realtimeSession();