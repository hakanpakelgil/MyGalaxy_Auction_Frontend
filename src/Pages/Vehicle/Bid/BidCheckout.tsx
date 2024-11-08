import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetVehicleByIdQuery } from '../../../Api/vehicleApi';
import userModel from '../../../Interfaces/userModel';
import { useSelector } from 'react-redux';
import { RootState } from '../../../Storage/store';
import { useDoPaymentMutation } from '../../../Api/paymentApi';
import './Styles/BidCheckout.css'
import { Loader } from '../../../Helper';
import { apiResponse } from '../../../Interfaces/apiResponse';
import { useDispatch } from 'react-redux';
import { getOrderInfo } from '../../../Storage/Redux/orderSlice';
import { getVehicle } from '../../../Storage/Redux/vehicleSlice';
import { useNavigate } from 'react-router-dom';

function BidCheckout() {

    const { vehicleId } = useParams();
    const { data, isLoading } = useGetVehicleByIdQuery(vehicleId);
    const userStore: userModel = useSelector((state: RootState) => state.authenticationStore);
    const [initialPayment] = useDoPaymentMutation();
    const Dispatch = useDispatch();
    const Navigate = useNavigate();

    const InitialState = {
        name:userStore.fullName,
        email:userStore.email,
        phoneNumber:"" 
    }

    const[phone,setPhoneState] = useState(InitialState.phoneNumber);
    const[name,setNameState] = useState(InitialState.name);
    const[email,setEmailState] = useState(InitialState.email);    
    const [loading,setLoadingState] = useState<boolean>();

    const handleSubmit = async (e:React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadingState(true);
        //iş kodları

        const {data} : apiResponse = await initialPayment({
            userId: userStore.nameid,
            vehicleId: vehicleId
        })

        if(data) {
            Dispatch(getOrderInfo({
                vehicleId:data?.result.vehicleId,
                userId:data?.result.userId,
                clientSecret:data?.result.clientSecret,
                stripePaymentIntentId:data?.result.stripePaymentIntentId,
            }))
        }
        
        Dispatch(getVehicle(vehicleId))
        Navigate("/payment",{
            state:{apiResult:data?.result, userStore}
        });

        setLoadingState(false);
    }

    if(data){
        return (
            <div className='container'>
                <div className='card text-center'>
                    <form onSubmit={handleSubmit}>
                        <img src={data.result.image} className='card-image' />
                        <div className='card-content text-center'>
                            <h3 className='card-title'>{data.result.brandAndModel}</h3>
                            <p className='card-text'><span className='text-black bold'>${data.result.auctionPrice}</span></p>
                        </div>
                        <div className='container'>
                            <div className='form-group mt-3'>
                                <span className='text-black'><strong> Name </strong></span>
                                <input className="form-control" type="text" placeholder="Default input" defaultValue={name} onChange={(e) => setNameState(e.target.value)} aria-label="default input example"></input>
                            </div>
                            <div className='form-group mt-3'>
                                <span className='text-black'><strong> Email </strong></span>
                                <input className="form-control" type="text" placeholder="Default input" 
                                defaultValue={email} onChange={(e) => setEmailState(e.target.value)}aria-label="default input example"></input>
                            </div>
                            <div className='form-group mt-3'>
                                <span className='text-black'><strong> Phone </strong></span>
                                <input className="form-control" type="text" placeholder="Default input" 
                                defaultValue={phone} onChange={(e) => setPhoneState(e.target.value)}aria-label="default input example"></input>
                            </div>
                        </div>
                        <div className='card-footer'>
                            <button type="submit" className='btn btn-lg btn-success form-control mt-3'>
                                {
                                    loading? (<Loader></Loader>) : "Pay Auction Price"
                                }
                                Pay
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
    else{
        return (
            <Loader></Loader>
        )
    }    
}

export default BidCheckout
