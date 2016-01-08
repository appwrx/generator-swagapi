'use strict';

var request = require('supertest');
var server = require('../server');

server.configure();

<%
var prevPath;
var prevVerb;
_.forEach(operations.methods, function (operation) {
    if (!prevPath || prevPath !== operations.path) {
        prevPath = operations.path;
%>
describe('<%=operations.path%> tests', function () {
    var app = server.app;
<%
    }
    if (!prevVerb || prevVerb !== operation.method) {
%>
    describe('<%=operation.method%> <%=operations.path%> tests', function () {
<%
    }
    var sendData = false;
    if (operation.parameters && operation.parameters.length) {
        _.forEach(operation.parameters, function (param) {
            if (param.in === 'body' && param.schema.$ref) {
                sendData = models[param.schema.$ref.slice(param.schema.$ref.lastIndexOf('/') + 1)];
            }
        });
    }

    _.forEach(operation.responses, function (response, status) {
        if (status === 'default') {
            status = 500;
        }
%>
        xit('<%=status%> <%=operation.method%> <%=operations.path%> test', function (done) {<% if (sendData) {%>
            var data = <%- util.inspect(sendData) %>;<%}%>
            request(app)
                .<%=operation.method%>('<%=resourcePath%><%=operations.path%>')<% if (sendData) {%>
                .send(data)<%}%>
                .expect(<%=status%>)
                .end(function (err, res) {
                    if (err) {
                        done.fail(err);
                    }
                    done();
                });
        });
<%
    })
    if (!prevVerb || prevVerb !== operation.method) {
%>
    });
<%
        prevVerb = operation.method;
    }
})
%>
});
