package com.j3566.stockinsight.tool

class ValidationUtils {

    companion object {

        fun isValidEmail(email: String): Boolean {

            if ( StringUtils.isBlank(email) ) {
                return false
            }

            return Regex("^[\\w!#\$%&’*+/=?`{|}~^-]+(?:\\.[\\w!#\$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}\$").matches(email)
        }


        fun isValidPassword(password: String): Boolean {

            if ( StringUtils.isBlank(password) ) {
                return false
            }

            return Regex("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,48}\$").matches(password)
        }

        fun isValidUserName(name: String): Boolean {

            if ( StringUtils.isBlank(name) ) {
                return false
            }

            return Regex("^[a-zA-Z0-9가-힇]{3,14}\$").matches(name)
        }
    }
}