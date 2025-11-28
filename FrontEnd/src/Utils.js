

// // not yet implemented, still in the works

// import ErrorNotification from "../Components/ErrorNotification";
// import useSWR from "swr";


// export function connectToEndpoint(fetcher, endpoint){
//      const { data, error, isLoading } = useSWR(
//        endpoint,
//        fetcher,
//        { refreshInterval: 1000 } // 3. Configuration: Auto-fetch every 1000ms (1s)
//      );

//      if (error)
//        return (
//          <div>
//            <ErrorNotification message="Error 500: Unable to connect to database" />
//          </div>
//        );

//      if (isLoading)
//        return (
//          <div>
//            <ErrorNotification message="loading dashboard" />
//          </div>
//        );

//     return data

// }