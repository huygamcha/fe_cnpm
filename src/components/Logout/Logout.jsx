import { LOCATIONS } from 'constants/index';
import { useNavigate } from 'react-router-dom';
import { GrLogout } from 'react-icons/gr';
import clsx from 'clsx';
import styles from './Logout.module.css'



function Logout() {
    const navigate = useNavigate();

    const handleLogout = () => {

        navigate(LOCATIONS.LOGIN);
        localStorage.clear();

    }
    return (
        <>
            <div className={clsx(styles.size, "d-flex")} onClick={handleLogout}>
                <div className={'me-2'}>Logout</div>
               <div> <GrLogout></GrLogout></div>
            </div>
        </>
    );
}

export default Logout;