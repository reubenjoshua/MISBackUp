import * as Yup from 'yup';
import { forIdentifier } from '@/helpers/validationUtils';

export const loginValidation = Yup.object().shape (
    {
        identifier: Yup.string()
                .required("Username is required")
                .test (
                    "is-valid-identifier",
                    "Enter a valid email or username with at least 3 characters",
                    forIdentifier
                ),
        password: Yup.string()
            .required("Password is required")
            .min(3, "Password must be at least 6 characters"),
    }
);