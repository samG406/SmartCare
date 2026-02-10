import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Doctor {
  doctor_id: number;
  user_id: number;
  title: string;
  department: string;
  experience: number | null;
  mobile: string;
  hospital_affiliation: string | null;
  full_name?: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface ScheduleData {
  [weekday: string]: TimeSlot[];
}

interface BookingState {
  selectedDoctor: number | null;
  selectedDate: string;
  selectedTime: string;
  appointmentType: string;
  notes: string;
  doctors: Doctor[];
  schedule: ScheduleData;
  scheduleLoading: boolean;
  bookingLoading: boolean;
  currentStep: number;
  bookedSlots: string[]; // Array of booked time slots for selected date (format: "YYYY-MM-DD HH:mm")
}

const initialState: BookingState = {
  selectedDoctor: null,
  selectedDate: '',
  selectedTime: '',
  appointmentType: 'Consultation',
  notes: '',
  doctors: [],
  schedule: {},
  scheduleLoading: false,
  bookingLoading: false,
  currentStep: 1,
  bookedSlots: [],
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSelectedDoctor: (state, action: PayloadAction<number | null>) => {
      state.selectedDoctor = action.payload;
      if (action.payload) {
        state.selectedDate = '';
        state.selectedTime = '';
      }
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
      state.selectedTime = '';
      state.bookedSlots = []; // Clear booked slots when date changes
    },
    setSelectedTime: (state, action: PayloadAction<string>) => {
      state.selectedTime = action.payload;
    },
    setAppointmentType: (state, action: PayloadAction<string>) => {
      state.appointmentType = action.payload;
    },
    setNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
    },
    setDoctors: (state, action: PayloadAction<Doctor[]>) => {
      state.doctors = action.payload;
    },
    setSchedule: (state, action: PayloadAction<ScheduleData>) => {
      state.schedule = action.payload;
    },
    setScheduleLoading: (state, action: PayloadAction<boolean>) => {
      state.scheduleLoading = action.payload;
    },
    setBookingLoading: (state, action: PayloadAction<boolean>) => {
      state.bookingLoading = action.payload;
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    resetBooking: (state) => {
      state.selectedDoctor = null;
      state.selectedDate = '';
      state.selectedTime = '';
      state.notes = '';
      state.appointmentType = 'Consultation';
      state.currentStep = 1;
      state.bookedSlots = [];
    },
    setBookedSlots: (state, action: PayloadAction<string[]>) => {
      state.bookedSlots = action.payload;
    },
  },
});

export const {
  setSelectedDoctor,
  setSelectedDate,
  setSelectedTime,
  setAppointmentType,
  setNotes,
  setDoctors,
  setSchedule,
  setScheduleLoading,
  setBookingLoading,
  setCurrentStep,
  resetBooking,
  setBookedSlots,
} = bookingSlice.actions;

export default bookingSlice.reducer;

