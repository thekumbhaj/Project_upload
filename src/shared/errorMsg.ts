/* eslint-disable */
export const ErrMessages = {
  'ErrPasswordConfirmPassword': 'Password and confirm password must be the same.',
  'ErrFileSize': 'File too large! (20 MB limit)',
  'ErrSelectDelivery': 'Please Select delivery option.',
  'ErrSelectCart': 'Please select product from cart.',
  'ErrLocationPermission': 'Please allow location permission',
  'ErrInvalidUrl': 'Invalid Url',
  'ErrGen': 'Something went wrong. please try after some time',
  'ErrProductVariantNotFound': 'Selected variant doesn\'t exists',
  'ErrProductQuantityMin': 'Quantity cannot be zero!',
  'ErrMobileNumber': 'You have changed your mobile number please verify',
  'ErrCommentTurnOff': 'Comments are disabled for this feed',
  'ErrRecordPermission': 'Please allow to record audio',
  'ErrProductAlreadyTagged': 'Product already tagged',
  'ErrFileUpload': 'Please upload files.',
  'ErrAddAddress': 'Please Add Address.',
  'ErrNoWishlist': 'Please select wishlist item.',
  'ErrOldPassword': 'Old Password is incorrect.',
  'ErrOtpLength': "Verification code must be exactly 6 digits",
  'ErrOfferCodeNotValid': "Offer code is not valid",
  'ErrOfferCodeMin': "Sorry, the offer code wasn't applied. Your order needs to be at least ${MIN_ORDER_VALUE} to use this code.",
  'ErrSocialLoginPassword': "Sorry, changing your password isn't an option since you've logged in through social media"
};
export const SuccessMessage = {
  PasswordResetCodeSent: 'Reset code sent successfully',
  PasswordResetSucess: 'Password reset successfully',
  PasswordChangedSucess: 'Password changed successfully',
  VerificationCodeSent: 'Verification code sent successfully',
  VerificationCodeReSent: 'Verification code resent successfully',
  FileDeleteSuccess: 'File deleted successfully',
  ChatDeleteSuccess: 'Chat deleted successfully',
  CartAdd: 'Product added to cart!',
  CartUpdate: 'Cart updated successfully!',
  AddressAdd: 'Address has been added successfully',
  AddressUpdate: 'Address updated successfully',
  AddressDelete: 'Address deleted successfully',
  ProfileUpdate: 'Profile updated successfully',
  OtpVerified: "Otp Verified successfully",
  productAdd: "added successfully.",
  productUpdate: "Product updated successfully.",
  ProductDelete: 'Product deleted successfully',

  PostUpdate: "Post updated successfully.",
  PostDelete: 'Post deleted successfully',

  RatingAdd: 'Thank you for rating us',
  RatingUpdate: 'Thank you for rating us',
  OrderIdCopied: 'Order Id Successfully to your clipboard',
  LinkCopied: 'Link copied successfully',
  Copy: 'Copied on clipboard',
  CampaignAdd: 'Campaign has been added successfully',
  AddWishlist: 'Added to wishlist!',
  RemoveWishlist: 'Removed from wishlist!',
  LoginRequired: 'Login Required',
  LoginNow: 'Login now',
  LoginLater: 'Login Later',
  LoginMessage: `To access our services and explore all that we offer, please log in. If you don't have an account yet, you can sign up to get started`
};
export const AllProductTypes = {
  Promotions: 'Promotions',
  Service: 'Service',
  Design: 'Design',
  DIY: 'DIY',
  Request: 'Request',
  RequestDonation: 'RequestDonation',
  Donation: 'Donation',
  Store: 'Store',
  Renovation: 'Renovation',
  Feed: 'Feed',
  Properties: 'Properties'
};
export const ORDER_STATUS_CODES = {
  PLACED_PAYMENT_UNVERIFIED: "PLACED_PAYMENT_UNVERIFIED",
  PLACED: "PLACED",
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
  PROCESSING: "PROCESSING",
  COMPLETE: "COMPLETE",
  RETURNREQ: "RETURNREQ",
  RETURNACCEPT: "RETURNACCEPT",
  RETURNCANCELL: "RETURNCANCELL",
  RETURNED: "RETURNED"
}
export const ORDER_STATUS_DESC:any = {
  PLACED_PAYMENT_UNVERIFIED: "Processing payment",
  PLACED: "Placed",
  CANCELLED: "Cancelled",
  FAILED: "Payment Failed",
  PROCESSING: "Processing",
  COMPLETE: "Delivered",
  RETURNREQ: "Return Requested",
  RETURNACCEPT: "Return Accepted",
  RETURNCANCELL: "Return Cancelled",
  RETURNED: "Item Returned"
}
export const STATUS_CODE = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
}
export const FILE_PATH = {
  PUBLIC: 'public',
  REVIEWS: 'Reviews',
  CHATS: 'Chats',
  CAMPAIGNS: 'Campaign',
  INVOICE: 'Invoices',
  POST: 'Posts',
  COMPANY: 'Company',
  PROPERTY: 'Property',
  COMPANY_PRIVATE: 'CompanyPrivate',
  CATEGORIES: 'Categories'
}

export const FIREBASE = {
  config: {
    apiKey: "AIzaSyDmuH63zSxqo-WMqvUgZByPlMwrgRm_si0",
    authDomain: "home360-app.firebaseapp.com",
    projectId: "home360-app",
    storageBucket: "home360-app.appspot.com",
    messagingSenderId: "746401024765",
    appId: "1:746401024765:web:a84b22aad3658bc89ccc94",
    measurementId: "G-K44SX6WC0K"
  },
  FCM_KEY: 'BF0l7j6SF_cxCcDdVSe1LNHlYZ5r4qDYis_CPbEWEF7CN3vwsSUV73EcXf-DS3ixTA74Rnw7HX8VhH1tduY1850'
}

export const SHIPPING_STATUS_DESC:any = {
  NOTSTARTEDYET: 'Not Shipped Yet',
  PROCESSING: 'IN Progress',
  CANCELLED: 'Cancelled',
  SHIPPED: 'Shipped',
  RETURNED: 'Returned'
}

export const ATTACHMENT_TYPE = {
  BOOKING: 'Booking',
  BAR_MESSAGE: "BAR_MESSAGE",
  PROPERTY: 'Property'
}

export const LOADING_MESSAGES = {
  PLS_WAIT: 'Please wait',
  GEN_AI: 'Please wait while we are drafting content for you'
}

export const MODULE_TYPE_LIKE = {
  POST: 'Post', 
  FEED: 'Feed',// campaign
  PRODUCT: 'Product'
}

export const CKEDITOR = {
  uiConfig: {
    poweredBy: {
      horizontalOffset: -100,
      label: 'Power',
      position: 'inside',
      side: 'left',
      verticalOffset: -1,
      forceVisible: false
    }
  }
}

export const ALERT_MESSAGE = {
  ORDER_RETURN_REQ: {
    TITLE: 'Are you sure ?',
    DESC: 'Do you want to return product ?'
  },
  LOGIN_CONFRIM: {
    TITLE: 'Login Required',
    DESC: "To access our services and explore all that we offer, please log in. If you don't have an account yet, you can sign up to get started.",
    OK: 'Login Now',
    CANCEL: 'Login Later'
  },
  DELETE_CHAT: {
    TITLE: 'Are you sure ?',
    DESC: 'Do you want to delete chat ?'
  },
  YES: 'Yes',
  NO: 'No',
  OK: 'Ok',
  CANCEL: 'Cancel'
}
export const BOOKING_STATUS = {
  Pending: "Pending",
  Success: "Accepted",
  Cancelled: "Cancelled",
  Rejected: "Rejected"
}
export const UPLOAD_TYPE = {
  Product: "Product",
  Review: 'Review'
}