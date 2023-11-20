import clsx from "clsx";
import Logout from "components/Logout/Logout";
import { Link } from "react-router-dom";
import styles from './Navigation.module.css'



function Navigation() {
    return (
        <div class="container">
            <div class="row" className={clsx("d-flex justify-content-between", styles.wrapper)} >
                <Link to="/products" class="col" className={clsx(styles.item)} >
                    Products
                </Link>
                <Link to="/suppliers" class="col" className={clsx(styles.item)}>
                    Suppliers
                </Link>
                <Link to="/categories" class="col" className={clsx(styles.item)}>
                    Categories
                </Link>
                <div class="col" className={clsx(styles.item)}>
                    <Logout></Logout>
                </div>
            </div>
        </div>

    );
}

export default Navigation;