import { useState } from 'react';
import { BottomWarning } from '../components/BottomWarning';
import { Button } from '../components/Button';
import { Heading } from '../components/Heading';
import { InputBox } from '../components/InputBox';
import { SubHeading } from '../components/SubHeading';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const Verify = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  return (
    <div className="bg-slate-300 h-screen flex justify-center">
      <div className="flex flex-col justify-center">
        <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
          <Heading label={'Verify'} />
          <SubHeading label={'Enter your Email id and token'} />
          <InputBox
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="John"
            label={'email'}
          />
          <InputBox
            onChange={(e) => {
              setToken(e.target.value);
            }}
            placeholder="123456"
            label={'token'}
          />
          <div className="pt-4">
            <Button
              onClick={async () => {
                const response = await axios.post(
                  'http://localhost:3000/api/v1/auth/verify',
                  {
                    email,
                    token,
                  }
                );
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard');
              }}
              label={'Verify'}
            />
          </div>
          <BottomWarning
            label={'Already have an account?'}
            buttonText={'Sign in'}
            to={'/signin'}
          />
        </div>
      </div>
    </div>
  );
};
