import { config } from '../config';
import Traveler from '../../database/models/travelers';
import _ from 'lodash';
const Twilio = require('twilio')(config.twilio.accountSid, config.twilio.authToken);     

export function sendText(req, res){
	if (_.isEmpty(req.body)) {
		return res.status(404).json({});
	}

    Twilio.sendMessage({
        to: req.body.to,
        messagingServiceSid: config.twilio.messagingSid,
        body: req.body.message,
    }, function(err, result) {
    	return res.status(200).json(result);
    });
};

export function respondToText(req, res, next) {
	var response = req.body.Body;
	var phoneStrTo = req.body.To.substring(req.body.To.length - 11);
	var phoneStrFrom = req.body.From.substring(req.body.From.length - 10);
	
	console.log('USER RESPOND:', response);

	if (response.toLowerCase() === 'ok') {
		return Traveler.find({
		    where: {
		    	phone: phoneStrTo 
		    }
		})
		.then(traveler => {
		    if (!traveler) {
		    	return res.status(404).end();
		    }
		    traveler.status = 'cleared';
		    traveler.save()
		    	.then(function(traveler) {
				    return res.json(traveler);
			    });

		    return res.status(200).end();
		})
		.catch(function(err) {
			return res.status(404).json(err);
		});
	} else {
		// TODO: Scheduler for sending a text again to user prompting status if ok
	}

	return res.status(200).json({});
}