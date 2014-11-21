define('modules/ui', [
    'jquery',
    'socketio',
    'modules/helpers'

], function($, io, helpers) {
    var socketUi = {};
    var socket = io.connect();
    socketUi.init = function() {
        this.updateMailNotifications();
        this.updateComments();
    };

    socketUi.updateMailNotifications = function() {
        $(document).ready(function() {
            $('#btn_mail-notifications').click(function(e) {
                socket.emit('updateMailNotifications');
                e.preventDefault();
            });
        });

        socket.on('updateMailNotifications', function(data) {
            var label = $('#btn_mail-notifications > span');
            if (data < 1) {
                label.hide();
            } else {
                label.html(data);
                label.show();
            }
        });
    };

    socketUi.updateComments = function() {
        $(document).ready(function() {
            $('form#comment-reply').submit(function(e) {
                var self = $(this);
                $.ajax({
                    type: self.attr('method'),
                    url: self.attr('action'),
                    data: self.serialize(),
                    success: function() {
                        //send socket to add reply.
                        $('form#comment-reply').find('*[data-clearOnSubmit="true"]').each(function() {
                            $(this).val('');
                        });

                        var tId = $('input[name="ticketId"]').val();

                        socket.emit('updateComments',{ticketId : tId});

                        var obj = $('.comments').parents('.page-content');
                        helpers.resizeFullHeight();
                        helpers.scrollToBottom(obj);
                    }
                });

                return false;
            });
        });

        socket.on('updateComments', function(data) {
            var ticket = data;
            var commentContainer = $('.comments');
            var comment = $(ticket.comments).get(-1);

            var commentText = 'Comments';
            if(ticket.comments.length === 1) commentText = 'Comment';

            $('.page-top-comments > a').html(ticket.comments.length + ' ' + commentText);

            var html =  '<div class="ticket-comment">' +
                        '<img src="/img/profile.png" alt=""/>' +
                            '<div class="issue-text">' +
                                '<h3>Re: ' + ticket.subject + '</h3>' +
                                '<a href="mailto:' + comment.owner.email + '">' + comment.owner.fullname + ' &lt;' + comment.owner.email + '&gt;</a>' +
                                '<time datetime="' + comment.date + '">' + helpers.formatDate(comment.date, "MMM DD, h:mma") + '</time>' +
                                '<p>' + comment.comment + '</p>' +
                            '</div>' +
                        '</div>';

            commentContainer.append(html);
        });
    };

    return socketUi;
});