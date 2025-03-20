import MomentUtils from '@date-io/moment';
import { getAuth } from "firebase/auth";

export const COLORS = {
    BACKGROUND: '#000000',
    BACKGROUND_ALT: '#231f20',
    GRAY: '#5c5c5c',
    WHITE: '#ffffff',
    RED: '#da291c',
    PRIMARY: '#1daccc',
};

export const LOADING			= 'loading';
export const FULL_NAME			= 'full_name';
export const CUSTOMER_NAME		= 'customer_name';
export const PHONE_NUMBER		= 'phone_number';
export const VERIFICATION_CODE	= 'verification_code';
export const USER			    = 'user';

export const CALL_BACK_PHONE    = 'call_back_phone';
export const TRACTOR_ID         = 'tractor_id';
export const ISSUE              = 'issue';
export const ISSUE_OTHER        = 'issue_other';

export const stringHasValue = ( string ) =>
{
    if( !string ){ return false; }

    if( string.trim().length === 0 ){ return false; }

    return true;
};

export const formatPhoneNumber = ( phone_number ) =>
{
    if( !phone_number )
    {
        return '';
    }

    phone_number = phone_number.trim();

    phone_number = phone_number.replace( /\D/g,'' );

    if( phone_number.length === 0 )
    {
        return '';
    }

    if( phone_number[0] === '1' )
    {
        phone_number = phone_number.substring( 1, phone_number.length );
    }

    if ( ( phone_number.length === 0 ) || ( phone_number.length !== 10 ) )
    {
        return '';
    }

    return `(${ phone_number.substring( 0, 3 ) }) ${ phone_number.substring( 3, 6 ) }-${ phone_number.substring( 6, 10 ) }`;
};

export const getToday = () =>
{
    const moment = new MomentUtils();

    return moment.date();
};

export const dateFormatterAlt = ( value ) =>
{
    if( value == null ){ return ''; }

    const moment    = new MomentUtils();
    const date      = moment.moment.unix( value );

    return date.format( 'MM/DD' );
};

export const findDeviceById = ( devices, id ) =>
{
    for( let i = 0; i < devices.length; i++ )
    {
       const device = devices[i];

       if( device.id === id )
       {
           return device;
       }
    }
};

export const getCurrentUser = () => {
    const auth = getAuth();
    return auth.currentUser;
};

export const PLACEHOLDER = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec interdum suscipit varius. Maecenas ornare imperdiet iaculis. Nam quis metus eget mi sollicitudin feugiat. Phasellus vitae molestie elit, sit amet ultrices dolor. Donec enim urna, rhoncus eget tortor vel, tincidunt tristique lacus. Pellentesque nec vestibulum erat. Duis pulvinar blandit tellus commodo fermentum. Vivamus bibendum justo semper nisi venenatis, sed faucibus risus bibendum.\n' +
    '\n' +
    'Curabitur at consectetur ante, id volutpat lacus. Curabitur lacinia volutpat massa non gravida. Suspendisse a dignissim nulla. In ut ex malesuada arcu imperdiet aliquam. Aenean sit amet tristique lectus. Curabitur sodales consequat imperdiet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam varius bibendum nunc, aliquam eleifend lorem varius ut. Maecenas elit lectus, consequat sed elementum id, commodo id massa. Morbi elementum ultricies dignissim. Integer id velit sapien. Integer lobortis rhoncus ultricies. Ut mollis tortor tortor, non congue velit mollis at. Sed in dignissim orci. Maecenas in ipsum commodo, rhoncus urna vel, porttitor nunc.\n' +
    '\n' +
    'Mauris sem lorem, fringilla a ante in, pharetra rutrum velit. Aenean rutrum odio id auctor laoreet. Curabitur eget vulputate dui. Praesent non dui rutrum, dapibus est sed, accumsan mi. Sed pretium dui ac nibh lacinia tempor. Donec congue nisl tincidunt leo posuere, id dapibus augue convallis. Sed et lorem at justo lacinia iaculis nec sit amet arcu. Nam fringilla felis quis aliquam faucibus. Pellentesque consequat dui aliquet mauris accumsan pretium. Aliquam erat volutpat. Aliquam consequat porta nulla, tristique elementum felis dapibus quis. Morbi dapibus arcu vitae nunc lobortis, at imperdiet mauris laoreet. Integer ullamcorper, nisl vitae condimentum vulputate, erat risus aliquet libero, at rhoncus ex enim a enim. Etiam quis leo gravida, mattis turpis quis, fringilla metus.\n' +
    '\n' +
    'Donec condimentum dolor at magna interdum, et congue lacus accumsan. Nullam eu mauris tincidunt est eleifend molestie id id lacus. Pellentesque cursus pellentesque mauris, in sodales purus sagittis non. Suspendisse potenti. Pellentesque semper nisl cursus purus tempus, ut molestie ante tincidunt. Aliquam erat volutpat. Integer lacinia pharetra enim, in feugiat velit accumsan sit amet. Sed viverra neque vitae nisi consectetur imperdiet. Nulla facilisi. Praesent sagittis lobortis eros eu commodo.\n' +
    '\n' +
    'Proin massa magna, aliquam nec lacus quis, pharetra convallis justo. Sed suscipit posuere leo in cursus. Suspendisse ac imperdiet purus, sed rhoncus tellus. Aliquam a risus non lectus imperdiet elementum sit amet venenatis metus. Etiam a orci et dui tincidunt luctus in vel magna. Nulla rhoncus, est in sagittis luctus, sem diam suscipit velit, pretium varius risus ligula vel nunc. Nulla eleifend placerat lacus, eget sollicitudin mauris dictum ut. Ut blandit bibendum risus, sed pretium diam interdum vitae. In vitae eros eget sapien mollis gravida a ac ex. Praesent feugiat enim nec lectus commodo, non congue ante porta. Ut nulla odio, aliquet eu magna quis, blandit porttitor nisl. Vivamus consectetur mattis sem, vel tincidunt leo consectetur nec. In laoreet arcu et ante scelerisque rhoncus. Etiam blandit, nulla lacinia venenatis mattis, turpis urna pretium arcu, ut ultricies nunc nulla non felis.';
