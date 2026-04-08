Make slot selection required	Save Attendance button is now disabled when selectedSessions.length === 0.
Add visual cue	A banner (Please select a lecture slot…) appears above the slot buttons when no slot is selected.
Force explicit confirmation	A Confirmation Modal (Modal component) now opens when the user clicks Save. It shows the selected date & slots, any network error, and provides Cancel / Confirm actions.
Highlight the currently active slot	Slot buttons now include animate‑pulse and a stronger shadow when selected, plus aria‑pressed for accessibility.
Documentation & UI hints	Added a multi‑line comment at the top of Faculty.tsx describing all new UI behaviours. Added an inline tooltip (ℹ️) next to the “Active Slots” label.
Network failure handling	New state networkError captures server / network errors in handleSave. The error message is displayed inside the confirmation modal, allowing the user to retry.
Additional UI state	confirmOpen (modal visibility) and networkError states added.
Minor UX tweaks	Updated handleSave to remove the redundant window.confirm prompt and to reset networkError before each save