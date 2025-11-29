# Driver Online Hours Calculation

The driver's "Online Hours" are calculated based on real-time session tracking.

## Logic

1.  **Session Start:** When a driver goes ONLINE, `onlineSince` timestamp is set in the `drivers/{uid}` document.
2.  **Real-time Update:** The Driver App runs a local timer that calculates `(Current Time - onlineSince)` every minute to display the "Current Session" duration.
3.  **Session End:** When a driver goes OFFLINE, the difference between `Current Time` and `onlineSince` is calculated and added to `todayOnlineMinutes` in the `drivers/{uid}` document. `onlineSince` is then set to `null`.
4.  **Total Display:** The UI displays `(todayOnlineMinutes + Current Session Duration) / 60` formatted to 1 decimal place.

## Firestore Fields

-   `onlineSince`: Timestamp (or null)
-   `todayOnlineMinutes`: Number (accumulated minutes for the day)

## Resetting

To reset the hours daily, a scheduled Cloud Function (Cron Job) should run at midnight to reset `todayOnlineMinutes` to 0 for all drivers.
*Note: This Cloud Function is not yet implemented.*
