
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

// https://stripe.com/docs/recipes/custom-checkout

// IMPORTANT: set these ENV vars on Heroku otherwise Stripe won't work.
const keyPublishable = process.env.PUBLISHABLE_KEY;
const keySecret = process.env.SECRET_KEY;
const stripe = require("stripe")(keySecret);
const bodyParser = require("body-parser");

const STRIPE_PLAN = 'monthly65';


/* util */
const decimalFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

const wholeFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0
})

// returns string formatted without decimal if amount is whole.
// returns 2 decimals if amount is not.
// example: 65 => "$65"
// example: 45.5 => "$45.50"
const formatPlanAmount = function (amount) {
	// stripe plan amounts need to be divided by 100
	if ((amount % 100) === 0) {
		return wholeFormatter.format(amount / 100)
	} else {
		return decimalFormatter.format(amount / 100)
	}
}

/* Stripe API */ 
async function checkCouponCode(couponCode) {
	let coupon = await stripe.coupons.retrieve(couponCode);
	return coupon;	
}

async function getDefaultPlan() {
	let plan = await stripe.plans.retrieve(STRIPE_PLAN);
	return plan;
}


async function landingHandler(req, res) {
	let plan;
	let coupon;

	try {
		plan = await getDefaultPlan();
	} catch(error) {
		console.error("plan fetch fail");
	}
	try {
		if (req.params.coupon) {
			coupon = await checkCouponCode(req.params.coupon);
		}
	} catch(error) {
		console.error("coupon fetch fail");
	}

	// set up template vars
	let defaultPlanAmount = plan.amount || 6500;
	let calculatedPlanAmount = defaultPlanAmount;
	if (coupon) {
		calculatedPlanAmount = defaultPlanAmount * (1-coupon.percent_off / 100);
	} 
	defaultPlanAmount = formatPlanAmount(defaultPlanAmount);
	calculatedPlanAmount = formatPlanAmount(calculatedPlanAmount);
	const templateData = {
		defaultPlanAmount,
		calculatedPlanAmount,
		coupon
	};
	templateData['hasCoupon'] = coupon ? true : false;
	res.render('pages/index', templateData);
}

express()
  .use(express.static(path.join(__dirname, 'public')))
  // for STRIPE
  .use(bodyParser.urlencoded({extended: false}))
  .use(bodyParser.json())
  // for STRIPE
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', landingHandler)
  .get('/:coupon', landingHandler)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
