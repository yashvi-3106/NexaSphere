import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ConnectivityState = {
  isOnline: boolean;
};

const initialState: ConnectivityState = {
  isOnline: true,
};

const connectivitySlice = createSlice({
  name: 'connectivity',
  initialState,
  reducers: {
    setOnline(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
  },
});

export const { setOnline } = connectivitySlice.actions;
export const selectConnectivity = (state: { connectivity: ConnectivityState }) =>
  state.connectivity;

export default connectivitySlice.reducer;
